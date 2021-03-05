// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState,  useEffect } from "react";

import { store } from "@app";
import { WalletMap } from "@reducers/WalletsReducer";
import * as wsActions from "@actions/WebsocketActions";
import * as nodeActions from "@actions/NodeActions";

import * as api from "@api";
import { KristAddress, KristBlock, KristTransaction, WSConnectionState, WSIncomingMessage, WSSubscriptionLevel } from "@api/types";
import { useWallets, findWalletByAddress, syncWallet, syncWalletUpdate, Wallet } from "@wallets/Wallet";
import WebSocketAsPromised from "websocket-as-promised";

import { throttle } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:ws");

const REFRESH_THROTTLE_MS = 500;
const DEFAULT_CONNECT_DEBOUNCE_MS = 1000;
const MAX_CONNECT_DEBOUNCE_MS = 360000;

class WebsocketConnection {
  private wallets?: WalletMap;
  private ws?: WebSocketAsPromised;
  private reconnectionTimer?: number;

  private messageID = 1;
  private connectDebounce = DEFAULT_CONNECT_DEBOUNCE_MS;

  private forceClosing = false;

  // TODO: automatically clean this up?
  private refreshThrottles: Record<string, (address: string) => void> = {};

  constructor(public syncNode: string) {
    debug("WS component init");
    this.attemptConnect();
  }

  setWallets(wallets: WalletMap): void {
    this.wallets = wallets;
  }

  private async connect() {
    debug("attempting connection to server...");
    this.setConnectionState("disconnected");

    // Get a websocket token
    const { url } = await api.post<{ url: string }>("ws/start");

    this.setConnectionState("connecting");

    // Connect to the websocket server
    this.ws = new WebSocketAsPromised(url, {
      packMessage: data => JSON.stringify(data),
      unpackMessage: data => JSON.parse(data.toString())
    });

    this.ws.onUnpackedMessage.addListener(this.handleMessage.bind(this));
    this.ws.onClose.addListener(this.handleClose.bind(this));

    this.messageID = 1;
    await this.ws.open();
    this.connectDebounce = DEFAULT_CONNECT_DEBOUNCE_MS;
  }

  async attemptConnect() {
    try {
      await this.connect();
    } catch (err) {
      this.handleDisconnect(err);
    }
  }

  private handleDisconnect(err?: Error) {
    if (this.reconnectionTimer) window.clearTimeout(this.reconnectionTimer);

    // TODO: show errors to the user?
    this.setConnectionState("disconnected");
    debug("failed to connect to server, reconnecting in %d ms", this.connectDebounce, err);

    this.reconnectionTimer = window.setTimeout(() => {
      this.connectDebounce = Math.min(this.connectDebounce * 2, MAX_CONNECT_DEBOUNCE_MS);
      this.attemptConnect();
    }, this.connectDebounce);
  }

  handleClose(event: { code: number; reason: string }) {
    debug("ws closed with code %d reason %s", event.code, event.reason);
    this.handleDisconnect();
  }

  /** Forcibly disconnect this instance from the websocket server (e.g. on
   * component unmount) */
  forceClose(): void {
    debug("received force close request");

    if (this.forceClosing) return;
    this.forceClosing = true;

    if (!this.ws || !this.ws.isOpened || this.ws.isClosed) return;
    debug("force closing ws");
    this.ws.close();
  }

  private setConnectionState(state: WSConnectionState) {
    store.dispatch(wsActions.setConnectionState(state));
  }

  handleMessage(data: WSIncomingMessage) {
    if (!this.ws || !this.ws.isOpened || this.ws.isClosed) return;

    if (data.ok === false || data.error)
      debug("message ERR: %d %s", data.id || -1, data.error);

    if (data.type === "hello") {
      // Initial connection
      debug("connected");
      this.setConnectionState("connected");

      // Subscribe to all the events
      this.subscribe("transactions");
      this.subscribe("blocks");
      this.subscribe("names");
      this.subscribe("motd");

      // Re-sync all balances just in case
      this.refreshBalances();
    } else if (data.address && this.wallets) {
      // Probably a response to `refreshBalance`
      const address: KristAddress = data.address;
      const wallet = findWalletByAddress(this.wallets, address.address);
      if (!wallet) return;

      debug("syncing %s to %s (balance: %d)", address.address, wallet.id, address.balance);
      syncWalletUpdate(wallet, address);
    } else if (data.type === "event" && data.event && this.wallets) {
      // Handle events
      switch (data.event) {
      case "transaction": {
        // If we receive a transaction relevant to any of our wallets, refresh
        // the balances.
        const transaction = data.transaction as KristTransaction;
        debug("transaction [%s] from %s to %s", transaction.type, transaction.from || "null", transaction.to || "null");

        const fromWallet = findWalletByAddress(this.wallets, transaction.from || undefined);
        const toWallet = findWalletByAddress(this.wallets, transaction.to);

        this.updateTransactionIDs(transaction, fromWallet, toWallet);

        switch (transaction.type) {
        // Update the name counts using the address lookup
        case "name_purchase":
        case "name_transfer":
          if (fromWallet) syncWallet(fromWallet);
          if (toWallet) syncWallet(toWallet);
          break;

        // Any other transaction; refresh the balances via the websocket
        default:
          if (fromWallet) this.refreshBalance(fromWallet.address);
          if (toWallet) this.refreshBalance(toWallet.address);
          break;
        }

        break;
      }
      case "block": {
        // Update the last block ID, which will trigger a re-fetch for
        // work-related and block value-related components.
        const block = data.block as KristBlock;
        debug("block id now %d", block.height);

        store.dispatch(nodeActions.setLastBlockID(block.height));

        break;
      }
      }
    }
  }

  private updateTransactionIDs(transaction: KristTransaction, fromWallet?: Wallet | null, toWallet?: Wallet | null) {
    // Updating these last IDs will trigger auto-refreshes on pages that
    // need them
    const id = transaction.id;

    debug("lastTransactionID now %d", id);
    store.dispatch(nodeActions.setLastTransactionID(id));

    if (fromWallet || toWallet) {
      debug("lastOwnTransactionID now %d", id);
      store.dispatch(nodeActions.setLastOwnTransactionID(id));
    }

    if (transaction.type.startsWith("name_")) {
      debug("lastNameTransactionID now %d", id);
      store.dispatch(nodeActions.setLastNameTransactionID(id));

      if (fromWallet || toWallet) {
        debug("lastOwnNameTransactionID now %d", id);
        store.dispatch(nodeActions.setLastOwnNameTransactionID(id));
      }
    }

    if (transaction.type !== "mined") {
      debug("lastNonMinedTransactionID now %d", id);
      store.dispatch(nodeActions.setLastNonMinedTransactionID(id));
    }
  }

  /** Queues a command to re-fetch an address's balance. The response will be
   * handled in {@link handleMessage}. This is automatically throttled to
   * execute on the leading edge of 500ms (REFRESH_THROTTLE_MS). */
  refreshBalance(address: string) {
    if (this.refreshThrottles[address]) {
      // Use the existing throttled function if it exists
      this.refreshThrottles[address](address);
    } else {
      // Create and cache a new throttle function for this address
      const throttled = throttle(
        this._refreshBalance.bind(this),
        REFRESH_THROTTLE_MS,
        { leading: true, trailing: false }
      );

      this.refreshThrottles[address] = throttled;
      throttled(address);
    }
  }

  private _refreshBalance(address: string) {
    debug("refreshing balance of %s", address);
    this.ws?.sendPacked({ type: "address", id: this.messageID++, address });
  }

  /** Re-syncs balances for all the wallets, just in case. */
  refreshBalances() {
    debug("refreshing all balances");

    const { wallets } = this;
    if (!wallets) return;

    for (const id in wallets) {
      this.refreshBalance(wallets[id].address);
    }
  }

  /** Subscribe to a Krist WS event. */
  subscribe(event: WSSubscriptionLevel) {
    this.ws?.sendPacked({ type: "subscribe", event, id: this.messageID++ });
  }
}

export function WebsocketService(): JSX.Element | null {
  const { wallets } = useWallets();
  const syncNode = api.useSyncNode();

  const [connection, setConnection] = useState<WebsocketConnection | undefined>();

  // On first render, or if the sync node changes, create the websocket
  // connection
  useEffect(() => {
    // Don't reconnect if we already have a connection and the sync node hasn't
    // changed (prevents infinite loops)
    if (connection && connection.syncNode === syncNode) return;

    // Close any existing connections
    if (connection) connection.forceClose();

    // Connect to the Krist websocket server
    setConnection(new WebsocketConnection(syncNode));

    // On unmount, force close the existing connection
    return () => {
      if (connection) connection.forceClose();
    };
  }, [syncNode, connection]);

  // If the wallets change, let the websocket service know so that it can keep
  // track of events related to any new wallets
  useEffect(() => {
    if (connection) connection.setWallets(wallets);
  }, [wallets, connection]);

  return null;
}
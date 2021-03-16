// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";
import * as actions from "@actions/WalletsActions";

import { getWalletKey, parseWallet, syncWallet } from "@wallets";

import Debug from "debug";
const debug = Debug("kristweb:storage-broadcast");

export const channel = new BroadcastChannel("kristweb:storage");

export function broadcastAddWallet(id: string): void {
  debug("broadcasting addWallet event for wallet id %s", id);
  channel.postMessage(["addWallet", id]);
}

export function broadcastEditWallet(id: string): void {
  debug("broadcasting editWallet event for wallet id %s", id);
  channel.postMessage(["editWallet", id]);
}

export function broadcastDeleteWallet(id: string): void {
  debug("broadcasting deleteWallet event for wallet id %s", id);
  channel.postMessage(["deleteWallet", id]);
}

/** Component that manages a BroadcastChannel responsible for dispatching wallet
 * storage events (add, edit, delete) across tabs. */
export function StorageBroadcast(): JSX.Element | null {
  // TODO: is it safe to register this here?
  debug("registering storage broadcast event listener");
  channel.onmessage = e => {
    debug("received storage broadcast:", e);

    if (Array.isArray(e.data)) {
      const [type, ...data] = e.data;

      if (type === "addWallet" || type === "editWallet") {
        const id: string = data[0];
        const key = getWalletKey(id);

        // Load the wallet from localStorage (the update should've been
        // synchronous)
        const wallet = parseWallet(id, localStorage.getItem(key));
        debug("%s broadcast %s", type, id);

        // Dispatch the new/updated wallet to the Redux store
        if (type === "addWallet") store.dispatch(actions.addWallet(wallet));
        else store.dispatch(actions.updateWallet(id, wallet));

        syncWallet(wallet, true);
      } else if (type === "deleteWallet") {
        const id: string = data[0];
        debug("addWallet broadcast %s", id);
        store.dispatch(actions.removeWallet(id));
      } else {
        debug("received unknown broadcast msg type %s", type);
      }
    }
  };

  return null;
}

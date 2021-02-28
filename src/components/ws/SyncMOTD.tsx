// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect } from "react";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";
import * as nodeActions from "../../store/actions/NodeActions";

import { store } from "../../App";

import * as api from "../../krist/api";
import { KristMOTD } from "../../krist/api/types";

import { recalculateWallets } from "../../krist/wallets/Wallet";

import Debug from "debug";
const debug = Debug("kristweb:sync-motd");

export async function updateMOTD(): Promise<void> {
  debug("updating motd");
  const data = await api.get<KristMOTD>("motd");

  debug("motd: %s", data.motd);
  store.dispatch(nodeActions.setCurrency(data.currency));
  store.dispatch(nodeActions.setConstants(data.constants));
}

/** Sync the MOTD with the Krist node on startup. */
export function SyncMOTD(): JSX.Element | null {
  const syncNode = api.useSyncNode();
  const connectionState = useSelector((s: RootState) => s.websocket.connectionState);

  // All these are used to determine if we need to recalculate the addresses
  const addressPrefix = useSelector((s: RootState) => s.node.currency.address_prefix);
  const masterPassword = useSelector((s: RootState) => s.walletManager.masterPassword);
  const wallets = useSelector((s: RootState) => s.wallets.wallets, shallowEqual);

  // Update the MOTD when the sync node changes, and on startup
  useEffect(() => {
    if (connectionState !== "connected") return;
    updateMOTD().catch(console.error);
  }, [syncNode, connectionState]);

  // When the currency's address prefix changes, or our master password appears,
  // recalculate the addresses if necessary
  useEffect(() => {
    if (!addressPrefix || !masterPassword) return;
    recalculateWallets(masterPassword, wallets, addressPrefix).catch(console.error);
  }, [addressPrefix, masterPassword, wallets]);

  return null;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@store";
import * as nodeActions from "@actions/NodeActions";

import { store } from "@app";

import * as api from "@api";
import { KristMOTD, KristMOTDBase } from "@api/types";

import {
  recalculateWallets, useWallets, useMasterPasswordOnly
} from "@wallets";
import { useAddressPrefix } from "@utils/currency";

import Debug from "debug";
const debug = Debug("kristweb:sync-motd");

export async function updateMOTD(): Promise<void> {
  debug("updating motd");
  const data = await api.get<KristMOTD>("motd");

  debug("motd: %s", data.motd);
  store.dispatch(nodeActions.setPackage(data.package));
  store.dispatch(nodeActions.setCurrency(data.currency));
  store.dispatch(nodeActions.setConstants(data.constants));

  if (data.last_block) {
    debug("motd last block id: %d", data.last_block.height);
    store.dispatch(nodeActions.setLastBlockID(data.last_block.height));
  }

  const motdBase: KristMOTDBase = {
    motd: data.motd,
    motdSet: new Date(data.motd_set),
    endpoint: data.public_url,
    debugMode: data.debug_mode,
    miningEnabled: data.mining_enabled
  };
  store.dispatch(nodeActions.setMOTD(motdBase));
}

/** Sync the MOTD with the Krist node on startup. */
export function SyncMOTD(): JSX.Element | null {
  const syncNode = api.useSyncNode();
  const connectionState = useSelector((s: RootState) => s.websocket.connectionState);

  // All these are used to determine if we need to recalculate the addresses
  const addressPrefix = useAddressPrefix();
  const masterPassword = useMasterPasswordOnly();
  const { wallets } = useWallets();

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

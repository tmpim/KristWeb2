// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect } from "react";

import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";
import * as nodeActions from "../../store/actions/NodeActions";

import { AppDispatch } from "../../App";
import { APIResponse, KristMOTD } from "../../krist/api/types";

import { recalculateWallets } from "../../krist/wallets/Wallet";

import Debug from "debug";
const debug = Debug("kristweb:sync-motd");

export async function updateMOTD(dispatch: AppDispatch, syncNode: string): Promise<void> {
  debug("updating motd");

  const res = await fetch(syncNode + "/motd");
  if (!res.ok || res.status !== 200) // TODO: handle API errors
    throw new Error("error fetching motd");

  const data: APIResponse<KristMOTD> = await res.json();
  if (!data?.ok) throw new Error("error fetching motd");

  debug("motd: %s", data.motd);
  dispatch(nodeActions.setCurrency(data.currency));
}

/** Sync the MOTD with the Krist node on startup. */
export function SyncMOTD(): JSX.Element | null {
  const syncNode = useSelector((s: RootState) => s.node.syncNode);
  const connectionState = useSelector((s: RootState) => s.websocket.connectionState);

  // All these are used to determine if we need to recalculate the addresses
  const addressPrefix = useSelector((s: RootState) => s.node.currency.address_prefix);
  const masterPassword = useSelector((s: RootState) => s.walletManager.masterPassword);
  const wallets = useSelector((s: RootState) => s.wallets.wallets, shallowEqual);

  const dispatch = useDispatch();

  // Update the MOTD when the sync node changes, and on startup
  useEffect(() => {
    // TODO: show errors to the user?
    updateMOTD(dispatch, syncNode).catch(console.error);
  }, [syncNode]);

  // Update the MOTD when the sync node reconnects, in case it changes in
  // realtime (basically only used for development)
  useEffect(() => {
    if (connectionState !== "connected") return;
    updateMOTD(dispatch, syncNode).catch(console.error);
  }, [connectionState]);

  // When the currency's address prefix changes, or our master password appears,
  // recalculate the addresses if necessary
  useEffect(() => {
    if (!addressPrefix || !masterPassword) return;
    recalculateWallets(dispatch, masterPassword, wallets, addressPrefix).catch(console.error);
  }, [addressPrefix, masterPassword, wallets]);

  return null;
}

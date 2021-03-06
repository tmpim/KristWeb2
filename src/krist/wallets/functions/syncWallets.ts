// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";
import * as actions from "@actions/WalletsActions";

import { KristAddressWithNames, lookupAddresses } from "../../api/lookup";

import { Wallet, saveWallet } from "..";

import Debug from "debug";
const debug = Debug("kristweb:sync-wallets");

function syncWalletProperties(
  wallet: Wallet,
  address: KristAddressWithNames | null,
  syncTime: Date
): Wallet {
  if (address) {
    return {
      ...wallet,
      ...(address.balance   !== undefined ? { balance: address.balance } : {}),
      ...(address.names     !== undefined ? { names: address.names } : {}),
      ...(address.firstseen !== undefined ? { firstSeen: address.firstseen } : {}),
      lastSynced: syncTime.toISOString()
    };
  } else {
    // Wallet was unsyncable (address not found), clear its properties
    return {
      ...wallet,
      balance: undefined,
      names: undefined,
      firstSeen: undefined,
      lastSynced: syncTime.toISOString()
    };
  }
}

/** Sync the data for a single wallet from the sync node, save it to local
 * storage, and dispatch the change to the Redux store. */
export async function syncWallet(
  wallet: Wallet,
  dontSave?: boolean
): Promise<void> {
  // Fetch the data from the sync node (e.g. balance)
  const { address } = wallet;
  const lookupResults = await lookupAddresses([address], true);

  debug("synced individual wallet %s (%s): %o", wallet.id, wallet.address, lookupResults);

  const kristAddress = lookupResults[address];
  syncWalletUpdate(wallet, kristAddress, dontSave);
}

/** Given an already synced wallet, save it to local storage, and dispatch the
 * change to the Redux store. */
export function syncWalletUpdate(
  wallet: Wallet,
  address: KristAddressWithNames | null,
  dontSave?: boolean
): void {
  const syncTime = new Date();
  const updatedWallet = syncWalletProperties(wallet, address, syncTime);

  // Save the wallet to local storage, unless this was an external sync action
  if (!dontSave) saveWallet(updatedWallet);

  if (address) {
    // Wallet synced successfully, dispatch the change to the Redux store
    store.dispatch(actions.syncWallet(wallet.id, updatedWallet));
  } else {
    // Wallet failed to sync, clear its properties
    store.dispatch(actions.unsyncWallet(wallet.id, syncTime));
  }
}

/** Sync the data for all the wallets from the sync node, save it to local
 * storage, and dispatch the changes to the Redux store. */
export async function syncWallets(): Promise<void> {
  const { wallets } = store.getState().wallets;

  const syncTime = new Date();

  // Fetch all the data from the sync node (e.g. balances)
  const addresses = Object.values(wallets).map(w => w.address);
  const lookupResults = await lookupAddresses(addresses, true);

  // Create a WalletMap with the updated wallet properties
  const updatedWallets = Object.entries(wallets).map(([_, wallet]) => {
    const kristAddress = lookupResults[wallet.address];
    if (!kristAddress) return wallet; // Skip unsyncable wallets
    return syncWalletProperties(wallet, kristAddress, syncTime);
  }).reduce((o, wallet) => ({ ...o, [wallet.id]: wallet }), {});

  // Save the wallets to local storage (unless dontSave is set)
  Object.values(updatedWallets).forEach(w => saveWallet(w as Wallet));

  // Dispatch the changes to the Redux store
  store.dispatch(actions.syncWallets(updatedWallets));
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";
import * as actions from "@actions/WalletsActions";

import { TranslatedError } from "@utils/i18n";

import { Wallet, WalletMap } from ".";
import { broadcastDeleteWallet } from "@global/StorageBroadcast";

import Debug from "debug";
const debug = Debug("kristweb:wallet-storage");

/** The limit provided by the Krist server for a single address lookup. In the
 * future I may implement batching for these, but for now, this seems like a
 * reasonable compromise to limit wallet storage. It should also give us a fair
 * upper bound for potential performance issues. */
export const ADDRESS_LIST_LIMIT = 128;

/** Get the local storage key for a given wallet. */
export function getWalletKey(wallet: Wallet | string): string {
  const id = typeof wallet === "string" ? wallet : wallet.id;
  return `wallet2-${id}`;
}

/** Extract a wallet ID from a local storage key. */
const walletKeyRegex = /^wallet2-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/;
export function extractWalletKey(key: string): [string, string] | undefined {
  const [, id] = walletKeyRegex.exec(key) || [];
  return id ? [key, id] : undefined;
}

export function parseWallet(id: string, data: string | null): Wallet {
  if (data === null) // localStorage key was missing
    throw new TranslatedError("masterPassword.walletStorageCorrupt");

  try {
    const wallet: Wallet = JSON.parse(data);

    // Validate the wallet data actually makes sense
    if (!wallet || !wallet.id || wallet.id !== id)
      throw new TranslatedError("masterPassword.walletStorageCorrupt");

    return wallet;
  } catch (e) {
    console.error(e);

    if (e.name === "SyntaxError") // Invalid JSON
      throw new TranslatedError("masterPassword.errorStorageCorrupt");
    else throw e; // Unknown error
  }
}

/** Loads all available wallets from local storage. */
export function loadWallets(): WalletMap {
  // Find all `wallet2` keys from local storage
  const keysToLoad = Object.keys(localStorage)
    .map(extractWalletKey)
    .filter(k => k !== undefined) as [string, string][];

  const wallets = keysToLoad.map(([key, id]) => parseWallet(id, localStorage.getItem(key)));

  // Convert to map with wallet IDs
  const walletMap: WalletMap = wallets.reduce((obj, w) => ({ ...obj, [w.id]: w }), {});

  return walletMap;
}

/** Saves a wallet to local storage, unless it has `dontSave` set. */
export function saveWallet(wallet: Wallet): void {
  if (wallet.dontSave) return;

  const key = getWalletKey(wallet);
  debug("saving wallet key %s", key);

  const serialised = JSON.stringify(wallet);
  localStorage.setItem(key, serialised);
}

/** Deletes a wallet, removing it from local storage and dispatching the change
 * to the Redux store. */
export function deleteWallet(wallet: Wallet): void {
  const key = getWalletKey(wallet);
  localStorage.removeItem(key);

  broadcastDeleteWallet(wallet.id); // Broadcast changes to other tabs

  store.dispatch(actions.removeWallet(wallet.id));
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { v4 as uuid } from "uuid";

import { applyWalletFormat, WalletFormatName } from "./formats/WalletFormat";
import { makeV2Address } from "../AddressAlgo";

import { aesGcmDecrypt, aesGcmEncrypt } from "../../utils/crypto";

import { KristAddressWithNames, lookupAddresses } from "../api/lookup";

import { AppDispatch } from "../../App";
import * as actions from "../../store/actions/WalletsActions";
import { WalletMap } from "../../store/reducers/WalletsReducer";

import { Mutex } from "async-mutex";

import Debug from "debug";
const debug = Debug("kristweb:wallet");

export interface Wallet {
  // UUID for this wallet
  id: string;

  // User assignable data
  label?: string;
  category?: string;

  // Login info
  encPassword: string; // Encrypted with master password, decrypted on-demand
  encPrivatekey: string; // The password with the password + wallet format applied
  username?: string;
  format: WalletFormatName;

  // Fetched from API
  address: string;
  balance?: number;
  names?: number;
  firstSeen?: string;
  lastSynced?: string;

  dontSave?: boolean; // Used to avoid saving when syncing
}

/** Properties of Wallet that are required to create a new wallet. */
export type WalletNewKeys = "label" | "category" | "username" | "format" | "dontSave";
export type WalletNew = Pick<Wallet, WalletNewKeys>;

/** Properties of Wallet that are allowed to be updated. */
export type WalletUpdatableKeys
  = "label" | "category" | "encPassword" | "encPrivatekey" | "username" | "format" | "address";
export const WALLET_UPDATABLE_KEYS: WalletUpdatableKeys[]
  = ["label", "category", "encPassword", "encPrivatekey", "username", "format", "address"];
export type WalletUpdatable = Pick<Wallet, WalletUpdatableKeys>;

/** Properties of Wallet that are allowed to be synced. */
export type WalletSyncableKeys
  = "balance" | "names" | "firstSeen" | "lastSynced";
export const WALLET_SYNCABLE_KEYS: WalletSyncableKeys[]
  = ["balance", "names", "firstSeen", "lastSynced"];
export type WalletSyncable = Pick<Wallet, WalletSyncableKeys>;

export interface DecryptedWallet { password: string; privatekey: string }

/** The limit provided by the Krist server for a single address lookup. In the
 * future I may implement batching for these, but for now, this seems like a
 * reasonable compromise to limit wallet storage. It should also give us a fair
 * upper bound for potential performance issues. */
export const ADDRESS_LIST_LIMIT = 128;

/** Get the local storage key for a given wallet. */
export function getWalletKey(wallet: Wallet): string {
  return `wallet2-${wallet.id}`;
}

/** Extract a wallet ID from a local storage key. */
const walletKeyRegex = /^wallet2-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/;
export function extractWalletKey(key: string): [string, string] | undefined {
  const [, id] = walletKeyRegex.exec(key) || [];
  return id ? [key, id] : undefined;
}

function loadWallet(id: string, data: string | null) {
  if (data === null) // localStorage key was missing
    throw new Error("masterPassword.walletStorageCorrupt");

  try {
    const wallet: Wallet = JSON.parse(data);

    // Validate the wallet data actually makes sense
    if (!wallet || !wallet.id || wallet.id !== id)
      throw new Error("masterPassword.walletStorageCorrupt");

    return wallet;
  } catch (e) {
    console.error(e);

    if (e.name === "SyntaxError") // Invalid JSON
      throw new Error("masterPassword.errorStorageCorrupt");
    else throw e; // Unknown error
  }
}

/** Loads all available wallets from local storage. */
export function loadWallets(): WalletMap {
  // Find all `wallet2` keys from local storage
  const keysToLoad = Object.keys(localStorage)
    .map(extractWalletKey)
    .filter(k => k !== undefined) as [string, string][];

  const wallets = keysToLoad.map(([key, id]) => loadWallet(id, localStorage.getItem(key)));

  // Convert to map with wallet IDs
  const walletMap: WalletMap = wallets.reduce((obj, w) => ({ ...obj, [w.id]: w }), {});

  return walletMap;
}

/** Saves a wallet to local storage, unless it has `dontSave` set. */
export function saveWallet(wallet: Wallet): void {
  if (wallet.dontSave) return;

  const key = getWalletKey(wallet);
  const serialised = JSON.stringify(wallet);
  localStorage.setItem(key, serialised);
}

function syncWalletProperties(wallet: Wallet, address: KristAddressWithNames, syncTime: Date): Wallet {
  return {
    ...wallet,
    ...(address.balance   !== undefined ? { balance: address.balance } : {}),
    ...(address.names     !== undefined ? { names: address.names } : {}),
    ...(address.firstseen !== undefined ? { firstSeen: address.firstseen } : {}),
    lastSynced: syncTime.toISOString()
  };
}

/** Sync the data for a single wallet from the sync node, save it to local
 * storage, and dispatch the change to the Redux store. */
export async function syncWallet(dispatch: AppDispatch, syncNode: string, wallet: Wallet): Promise<void> {
  // Fetch the data from the sync node (e.g. balance)
  const { address } = wallet;
  const lookupResults = await lookupAddresses(syncNode, [address], true);

  const kristAddress = lookupResults[address];
  if (!kristAddress) return; // Skip unsyncable wallet

  syncWalletUpdate(dispatch, wallet, kristAddress);
}

/** Given an already synced wallet, save it to local storage, and dispatch the
 * change to the Redux store. */
export function syncWalletUpdate(dispatch: AppDispatch, wallet: Wallet, address: KristAddressWithNames): void {
  const syncTime = new Date();
  const updatedWallet = syncWalletProperties(wallet, address, syncTime);

  // Save the wallet to local storage (unless dontSave is set)
  saveWallet(updatedWallet);

  // Dispatch the change to the Redux store
  dispatch(actions.syncWallet(wallet.id, updatedWallet));
}

/** Sync the data for all the wallets from the sync node, save it to local
 * storage, and dispatch the changes to the Redux store. */
export async function syncWallets(dispatch: AppDispatch, syncNode: string, wallets: WalletMap): Promise<void> {
  const syncTime = new Date();

  // Fetch all the data from the sync node (e.g. balances)
  const addresses = Object.values(wallets).map(w => w.address);
  const lookupResults = await lookupAddresses(syncNode, addresses, true);

  // Create a WalletMap with the updated wallet properties
  const updatedWallets = Object.entries(wallets).map(([_, wallet]) => {
    const kristAddress = lookupResults[wallet.address];
    if (!kristAddress) return wallet; // Skip unsyncable wallets
    return syncWalletProperties(wallet, kristAddress, syncTime);
  }).reduce((o, wallet) => ({ ...o, [wallet.id]: wallet }), {});

  // Save the wallets to local storage (unless dontSave is set)
  Object.values(updatedWallets).forEach(w => saveWallet(w as Wallet));

  // Dispatch the changes to the Redux store
  dispatch(actions.syncWallets(updatedWallets));
}

/**
 * Adds a new wallet, encrypting its privatekey and password, saving it to
 * local storage, and dispatching the changes to the Redux store.
 *
 * @param dispatch - The AppDispatch instance used to dispatch the new wallet to
 *   the Redux store.
 * @param syncNode - The Krist sync node to fetch the wallet data from.
 * @param addressPrefix - The prefixes of addresses on this node.
 * @param masterPassword - The master password used to encrypt the wallet
 *   password and privatekey.
 * @param wallet - The information for the new wallet.
 * @param password - The password of the new wallet.
 * @param save - Whether or not to save this wallet to local storage.
 */
export async function addWallet(
  dispatch: AppDispatch,
  syncNode: string,
  addressPrefix: string,
  masterPassword: string,
  wallet: WalletNew,
  password: string,
  save: boolean
): Promise<void> {
  // Calculate the privatekey for the given wallet format
  const privatekey = await applyWalletFormat(wallet.format || "kristwallet", password, wallet.username);
  const address = await makeV2Address(addressPrefix, privatekey);

  const id = uuid();

  // Encrypt the password and privatekey. These will be decrypted on-demand.
  const encPassword = await aesGcmEncrypt(password, masterPassword);
  const encPrivatekey = await aesGcmEncrypt(privatekey, masterPassword);

  const newWallet = {
    id, address,

    label: wallet.label?.trim() || undefined, // clean up empty strings
    category: wallet.category?.trim() || undefined,

    username: wallet.username,
    encPassword,
    encPrivatekey,
    format: wallet.format,

    ...(save ? {} : { dontSave: true })
  };

  // Save the wallet to local storage if wanted
  if (save) saveWallet(newWallet);

  // Dispatch the changes to the redux store
  dispatch(actions.addWallet(newWallet));

  syncWallet(dispatch, syncNode, newWallet);
}

/**
 * Edits a new wallet, encrypting its privatekey and password, saving it to
 * local storage, and dispatching the changes to the Redux store.
 *
 * @param dispatch - The AppDispatch instance used to dispatch the new wallet to
 *   the Redux store.
 * @param syncNode - The Krist sync node to fetch the wallet data from.
 * @param addressPrefix - The prefixes of addresses on this node.
 * @param masterPassword - The master password used to encrypt the wallet
 *   password and privatekey.
 * @param wallet - The old wallet information.
 * @param updated - The new wallet information.
 * @param password - The password of the updated wallet.
 */
export async function editWallet(
  dispatch: AppDispatch,
  syncNode: string,
  addressPrefix: string,
  masterPassword: string,
  wallet: Wallet,
  updated: WalletNew,
  password: string
): Promise<void> {
  // Calculate the privatekey for the given wallet format
  const privatekey = await applyWalletFormat(updated.format || "kristwallet", password, updated.username);
  const address = await makeV2Address(addressPrefix, privatekey);

  // Encrypt the password and privatekey. These will be decrypted on-demand.
  const encPassword = await aesGcmEncrypt(password, masterPassword);
  const encPrivatekey = await aesGcmEncrypt(privatekey, masterPassword);

  const finalWallet = {
    ...wallet,

    label: updated.label?.trim() || undefined, // clean up empty strings
    category: updated.category?.trim() || undefined,

    address,
    username: updated.username,
    encPassword,
    encPrivatekey,
    format: updated.format
  };

  // Save the updated wallet to local storage
  saveWallet(finalWallet);

  // Dispatch the changes to the redux store
  dispatch(actions.updateWallet(wallet.id, finalWallet));

  syncWallet(dispatch, syncNode, finalWallet);
}

/** Deletes a wallet, removing it from local storage and dispatching the change
 * to the Redux store. */
export function deleteWallet(dispatch: AppDispatch, wallet: Wallet): void {
  const key = getWalletKey(wallet);
  localStorage.removeItem(key);

  dispatch(actions.removeWallet(wallet.id));
}

/** Decrypts a wallet's password and privatekey. */
export async function decryptWallet(masterPassword: string, wallet: Wallet): Promise<DecryptedWallet | null> {
  try {
    const decPassword = await aesGcmDecrypt(wallet.encPassword, masterPassword);
    const decPrivatekey = await aesGcmDecrypt(wallet.encPrivatekey, masterPassword);

    return { password: decPassword, privatekey: decPrivatekey };
  } catch (e) {
    // OperationError usually means decryption failure
    if (e.name === "OperationError") return null;

    console.error(e);
    return null;
  }
}

/** Finds a wallet in the wallet map by the given Krist address. */
export function findWalletByAddress(wallets: WalletMap, address?: string): Wallet | null {
  if (!address) return null;

  for (const id in wallets)
    if (wallets[id].address === address)
      return wallets[id];

  return null;
}

const recalculationMutex = new Mutex();
/** If the address prefix changes (e.g. swapping sync node), and we are
 * decrypted, recalculate all the addresses with the new prefix. If the prefix
 * is unchanged, this does nothing. The changes will be dispatched to the
 * Redux store. */
export async function recalculateWallets(dispatch: AppDispatch, masterPassword: string, wallets: WalletMap, addressPrefix: string): Promise<void> {
  const lastPrefix = localStorage.getItem("lastAddressPrefix") || "k";
  if (addressPrefix === lastPrefix) return;
  debug("address prefix changed from %s to %s, waiting for mutex...", lastPrefix, addressPrefix);

  // Don't allow more than one recalculation at a time
  await recalculationMutex.runExclusive(async () => {
    const lastPrefix = localStorage.getItem("lastAddressPrefix") || "k";
    if (addressPrefix === lastPrefix) {
      debug("prefix was already reset while we were calculating");
      return;
    }

    debug("recalculating all wallets", lastPrefix, addressPrefix);

    // Map of wallet IDs -> new addresses
    const updatedWallets: Record<string, string> = {};

    // Recalculate all the wallets
    for (const id in wallets) {
      // Prepare the wallet for recalculation
      const wallet = wallets[id];
      const decrypted = await decryptWallet(masterPassword, wallet);
      if (!decrypted)
        throw new Error(`couldn't decrypt wallet ${wallet.id}!`);

      // Calculate the new address
      const privatekey = await applyWalletFormat(wallet.format || "kristwallet", decrypted.password, wallet.username);
      const address = await makeV2Address(addressPrefix, privatekey);

      if (wallet.address === address) continue;

      // Prepare the change to be applied
      debug("old address: %s - new address: %s", wallet.address, address);
      updatedWallets[wallet.id] = address;
    }

    // Now that we know everything converted successfully, save the updated
    // wallets to local storage
    for (const id in wallets) {
      const wallet = wallets[id];
      saveWallet({ ...wallet, address: updatedWallets[wallet.id] });
    }

    // Apply all the changes to the Redux store
    dispatch(actions.recalculateWallets(updatedWallets));

    debug("recalculation done, saving prefix");
    localStorage.setItem("lastAddressPrefix", addressPrefix);
  });
}

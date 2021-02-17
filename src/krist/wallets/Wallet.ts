import { v4 as uuid } from "uuid";

import { applyWalletFormat, WalletFormatName } from "./formats/WalletFormat";
import { makeV2Address } from "../AddressAlgo";

import { aesGcmEncrypt } from "../../utils/crypto";

import { KristAddressWithNames, lookupAddresses } from "../api/lookup";

import { AppDispatch } from "../../App";
import * as actions from "../../store/actions/WalletsActions";
import { WalletMap } from "../../store/reducers/WalletsReducer";

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
export type WalletUpdatableKeys = "label" | "category" | "encPassword" | "encPrivatekey" | "username" | "format" | "address";
export type WalletUpdatable = Pick<Wallet, WalletUpdatableKeys>;

/** Properties of Wallet that are allowed to be synced. */
export type WalletSyncableKeys = "balance" | "names" | "firstSeen" | "lastSynced";
export type WalletSyncable = Pick<Wallet, WalletSyncableKeys>;

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
    balance: address.balance,
    names: address.names,
    firstSeen: address.first_seen,
    lastSynced: syncTime.toISOString()
  };
}

/** Sync the data for a single wallet from the sync node, save it to local
 * storage, and dispatch the change to the Redux store. */
export async function syncWallet(dispatch: AppDispatch, wallet: Wallet): Promise<void> {
  const syncTime = new Date();

  // Fetch the data from the sync node (e.g. balance)
  const { address } = wallet;
  const lookupResults = await lookupAddresses([address], true);

  const kristAddress = lookupResults[address];
  if (!kristAddress) return; // Skip unsyncable wallet

  const updatedWallet = syncWalletProperties(wallet, kristAddress, syncTime);

  // Save the wallet to local storage (unless dontSave is set)
  saveWallet(updatedWallet);

  // Dispatch the change to the Redux store
  dispatch(actions.syncWallet(wallet.id, updatedWallet));
}

/** Sync the data for all the wallets from the sync node, save it to local
 * storage, and dispatch the changes to the Redux store. */
export async function syncWallets(dispatch: AppDispatch, wallets: WalletMap): Promise<void> {
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
  dispatch(actions.syncWallets(updatedWallets));
}

/** Adds a new wallet, encrypting its privatekey and password, saving it to
 * local storage, and dispatching the changes to the Redux store.
 *
 * @param dispatch - The AppDispatch instance used to dispatch the new wallet to
 *   the Redux store.
 * @param masterPassword - The master password used to encrypt the wallet
 *   password and privatekey.
 * @param wallet - The information for the new wallet.
 * @param password - The password of the new wallet.
 * @param save - Whether or not to save this wallet to local storage.
 */
export async function addWallet(
  dispatch: AppDispatch,
  masterPassword: string,
  wallet: WalletNew,
  password: string,
  save: boolean
): Promise<Wallet> {
  // Calculate the privatekey for the given wallet format
  const privatekey = await applyWalletFormat(wallet.format || "kristwallet", password, wallet.username);
  const address = await makeV2Address(privatekey);

  const id = uuid();

  // Encrypt the password and privatekey. These will be decrypted on-demand.
  const encPassword = await aesGcmEncrypt(password, masterPassword);
  const encPrivatekey = await aesGcmEncrypt(privatekey, masterPassword);

  const newWallet = {
    id, address,

    label: wallet.label,
    category: wallet.category,

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

  syncWallet(dispatch, newWallet);

  return newWallet;
}

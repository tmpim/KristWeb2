import { WalletFormatName } from "./formats/WalletFormat";

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
  password: string; // Encrypted with master password, decrypted on-demand
  username?: string;
  format: WalletFormatName;

  // Fetched from API
  address: string;
  balance: number;
  names: number;
  firstSeen?: Date;
}

/** Properties of Wallet that are allowed to be updated. */
export type WalletUpdatableKeys = "label" | "category" | "password" | "username" | "format" | "address";
export type WalletUpdatable = Pick<Wallet, WalletUpdatableKeys>;

/** Properties of Wallet that are allowed to be synced. */
export type WalletSyncableKeys = "balance" | "names" | "firstSeen";
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

/** Loads all available wallets from local storage and dispatches them to the
 * Redux store. */
export async function loadWallets(dispatch: AppDispatch): Promise<void> {
  // Find all `wallet2` keys from local storage
  const keysToLoad = Object.keys(localStorage)
    .map(extractWalletKey)
    .filter(k => k !== undefined) as [string, string][];

  const wallets = keysToLoad.map(([key, id]) => loadWallet(id, localStorage.getItem(key)));

  // Convert to map with wallet IDs
  const walletMap: WalletMap = wallets.reduce((obj, w) => ({ ...obj, [w.id]: w }), {});

  dispatch(actions.loadWallets(walletMap));
}

import { DateString } from "@krist/types/KristTypes";
import { WalletFormatName } from "./formats/WalletFormat";

import { AESEncryptedString, aesGcmDecrypt, aesGcmEncrypt } from "@utils/crypto";

import { AppDispatch } from "@app/App";
import * as actions from "@actions/WalletsActions";
import { WalletMap } from "@reducers/WalletsReducer";

export interface Wallet {
  // UUID for this wallet
  id: string;

  // User assignable data
  label?: string;
  category?: string;

  // Login info
  password: string;
  username?: string;
  format: WalletFormatName;

  // Fetched from API
  address: string;
  balance: number;
  names: number;
  firstSeen?: DateString;
}

/** Properties of Wallet that are allowed to be updated. */
export type WalletUpdatableKeys = "label" | "category" | "password" | "username" | "format" | "address";
export type WalletUpdatable = Pick<Wallet, WalletUpdatableKeys>;

/** Properties of Wallet that are allowed to be synced. */
export type WalletSyncableKeys = "balance" | "names" | "firstSeen";
export type WalletSyncable = Pick<Wallet, WalletSyncableKeys>;

export async function decryptWallet(id: string, data: AESEncryptedString | null, masterPassword: string): Promise<Wallet> {
  if (data === null) // localStorage key was missing
    throw new Error("masterPassword.walletStorageCorrupt");

  try {
    // Attempt to decrypt and deserialize the wallet data
    const dec = await aesGcmDecrypt(data, masterPassword);
    const wallet: Wallet = JSON.parse(dec);
    
    // Validate the wallet data actually makes sense
    if (!wallet || !wallet.id || wallet.id !== id)
      throw new Error("masterPassword.walletStorageCorrupt");

    return wallet;
  } catch (e) {    
    if (e.name === "OperationError") {
      // OperationError usually means decryption failure
      console.error(e);
      throw new Error("masterPassword.errorPasswordIncorrect");
    } else if (e.name === "SyntaxError") {
      // SyntaxError means the JSON was invalid
      console.error(e);
      throw new Error("masterPassword.errorStorageCorrupt");
    } else {
      // Unknown error
      throw e;
    }
  }
}

export async function encryptWallet(wallet: Wallet, masterPassword: string): Promise<AESEncryptedString> {
  const data = JSON.stringify(wallet);
  const enc = await aesGcmEncrypt(data, masterPassword);
  return enc;
}

/** Get the local storage key for a given wallet. */
export function getWalletKey(wallet: Wallet): string {
  return `wallet2-${wallet.id}`;
}

/** Extract a wallet ID from a local storage key. */
const walletKeyRegex = /^wallet2-([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/;
export function extractWalletKey(key: string): [string, string] | undefined {
  const [,id] = walletKeyRegex.exec(key) || [];
  return id ? [key, id] : undefined;
}

/** Loads all available wallets from local storage and dispatches them to the
 * Redux store. */
export async function loadWallets(dispatch: AppDispatch, masterPassword: string): Promise<void> {
  // Find all `wallet2` keys from local storage.
  const keysToLoad = Object.keys(localStorage)
    .map(extractWalletKey)
    .filter(k => k !== undefined);
    
  const wallets = await Promise.all(keysToLoad
    .map(([key, id]) => decryptWallet(id, localStorage.getItem(key), masterPassword)));

  // Convert to map with wallet IDs
  const walletMap: WalletMap = wallets.reduce((obj, w) => ({ ...obj, [w.id]: w }), {});

  dispatch(actions.loadWallets(walletMap));
}

// TODO: temporary exposure of methods for testing
declare global {
  interface Window {
    encryptWallet: typeof encryptWallet;
  }
}
window.encryptWallet = encryptWallet;

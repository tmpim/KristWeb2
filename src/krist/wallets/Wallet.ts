// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { WalletFormatName } from ".";

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

export interface WalletMap { [key: string]: Wallet }

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

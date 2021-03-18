// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { aesGcmDecrypt } from "@utils/crypto";

import { WalletAddressMap } from "..";

export interface EncryptedWallet { encPassword: string; encPrivatekey: string }
export interface DecryptedWallet { password: string; privatekey: string }

/** Decrypts a wallet's password and privatekey. */
export async function decryptWallet(
  masterPassword: string,
  wallet: EncryptedWallet
): Promise<DecryptedWallet | null> {
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

export const DecryptErrorGone = Symbol("KWDecryptErrorGone");
export const DecryptErrorFailed = Symbol("KWDecryptErrorFailed");

// TODO: use these in decryptWallet too (will require some refactoring)
export type DecryptResult = DecryptedWallet
  | typeof DecryptErrorGone
  | typeof DecryptErrorFailed;

export type DecryptedAddresses = Record<string, DecryptResult>;
export type ValidDecryptedAddresses = Record<string, DecryptedWallet>;

/** Decrypts an array of wallets by address at once. */
export async function decryptAddresses(
  masterPassword: string,
  walletAddressMap: WalletAddressMap,
  addresses: string[]
): Promise<DecryptedAddresses> {
  // Ensure the array of addresses is unique
  const uniqAddresses = [...new Set(addresses)];
  const out: DecryptedAddresses = {};

  // Try to decrypt each address
  for (const address of uniqAddresses) {
    // Find the wallet by address and verify it actually exists
    const wallet = walletAddressMap[address];
    if (!wallet) {
      out[address] = DecryptErrorGone;
      continue;
    }

    // Decrypt the wallet, erroring if it fails
    const dec = await decryptWallet(masterPassword, wallet);
    if (!dec) {
      out[address] = DecryptErrorFailed;
      continue;
    }

    out[address] = dec;
  }

  return out;
}

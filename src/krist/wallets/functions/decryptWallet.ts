// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { aesGcmDecrypt } from "@utils/crypto";

import { Wallet } from "..";

export interface DecryptedWallet { password: string; privatekey: string }

/** Decrypts a wallet's password and privatekey. */
export async function decryptWallet(
  masterPassword: string,
  wallet: Wallet
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

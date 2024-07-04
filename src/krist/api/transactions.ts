// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { TranslatedError } from "@utils/i18n";

import { KristTransaction } from "./types";
import * as api from ".";

import { Wallet, decryptWallet } from "@wallets";
import { v4 as uuidv4 } from "uuid";

interface MakeTransactionResponse {
  transaction: KristTransaction;
}

export async function makeTransaction(
  masterPassword: string,
  requestId: string,
  from: Wallet,
  to: string,
  amount: number,
  metadata?: string
): Promise<KristTransaction> {
  // Attempt to decrypt the wallet to get the privatekey
  const decrypted = await decryptWallet(masterPassword, from);
  if (!decrypted)
    throw new TranslatedError("sendTransaction.errorWalletDecrypt");
  const { privatekey } = decrypted;

  let seed = localStorage.getItem("txSeed");
  if (!seed) {
    seed = uuidv4();
    localStorage.setItem("txSeed", seed);
  }

  const { transaction } = await api.post<MakeTransactionResponse>(
    "/transactions",
    {
      privatekey,
      to,
      amount,
      metadata: metadata || undefined, // Clean up empty strings
      requestId,
      requestIdSeed: seed
    }
  );

  return transaction;
}

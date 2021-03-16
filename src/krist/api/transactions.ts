// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { TranslatedError } from "@utils/i18n";

import { KristTransaction } from "./types";
import * as api from ".";

import { Wallet, decryptWallet } from "@wallets";

interface MakeTransactionResponse {
  transaction: KristTransaction;
}

export async function makeTransaction(
  masterPassword: string,
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

  const { transaction } = await api.post<MakeTransactionResponse>(
    "/transactions",
    {
      privatekey, to, amount,
      metadata: metadata || undefined // Clean up empty strings
    }
  );

  return transaction;
}

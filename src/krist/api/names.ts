// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { TranslatedError } from "@utils/i18n";

import * as api from ".";
import { AuthFailedError } from "@api/AuthFailed";

import { ValidDecryptedAddresses, Wallet, decryptWallet } from "@wallets";

import Debug from "debug";
const debug = Debug("kristweb:api-names");

export type ProgressCallback = () => void;

interface PartialName {
  name: string;
  owner: string;
}

/** Convert auth_failed errors to AuthFailedError so the modal can display the
 * correct address. */
async function wrapAuthFailedError(name: PartialName, err: Error) {
  if (err.message === "auth_failed")
    throw new AuthFailedError(err.message, name.owner);
  else
    throw err;
}

export async function transferNames(
  decryptedAddresses: ValidDecryptedAddresses,
  names: PartialName[],
  recipient: string,
  onProgress?: ProgressCallback
): Promise<void> {
  for (const name of names) {
    const { privatekey } = decryptedAddresses[name.owner];
    const onError = wrapAuthFailedError.bind(undefined, name);

    debug("transferring name %s from %s to %s",
      name.name, name.owner, recipient);

    await api.post(
      `/names/${encodeURIComponent(name.name)}/transfer`,
      { address: recipient, privatekey }
    ).catch(onError);

    onProgress?.();
  }
}

export async function updateNames(
  decryptedAddresses: ValidDecryptedAddresses,
  names: PartialName[],
  aRecord?: string | null,
  onProgress?: ProgressCallback
): Promise<void> {
  for (const name of names) {
    const { privatekey } = decryptedAddresses[name.owner];
    const onError = wrapAuthFailedError.bind(undefined, name);

    debug("updating name %s a record to %s", name.name, aRecord);

    await api.post(
      `/names/${encodeURIComponent(name.name)}/update`,
      { a: aRecord?.trim() || null, privatekey }
    ).catch(onError);

    onProgress?.();
  }
}

export async function purchaseName(
  masterPassword: string,
  wallet: Wallet,
  name: string
): Promise<void> {
  // Attempt to decrypt the wallet to get the privatekey
  const decrypted = await decryptWallet(masterPassword, wallet);
  if (!decrypted)
    throw new TranslatedError("namePurchase.errorWalletDecrypt");
  const { privatekey } = decrypted;

  await api.post(
    `names/${encodeURIComponent(name)}`,
    { privatekey }
  );
}

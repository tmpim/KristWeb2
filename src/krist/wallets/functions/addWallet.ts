// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { v4 as uuid } from "uuid";

import { store } from "@app";
import * as actions from "@actions/WalletsActions";

import { aesGcmEncrypt } from "@utils/crypto";

import { Wallet, WalletNew, saveWallet, syncWallet, calculateAddress } from "..";

/**
 * Adds a new wallet, encrypting its privatekey and password, saving it to
 * local storage, and dispatching the changes to the Redux store.
 *
 * @param addressPrefix - The prefixes of addresses on this node.
 * @param masterPassword - The master password used to encrypt the wallet
 *   password and privatekey.
 * @param wallet - The information for the new wallet.
 * @param password - The password of the new wallet.
 * @param save - Whether or not to save this wallet to local storage.
 */
export async function addWallet(
  addressPrefix: string,
  masterPassword: string,
  wallet: WalletNew,
  password: string,
  save: boolean
): Promise<Wallet> {
  // Calculate the privatekey and address for the given wallet format
  const { privatekey, address } = await calculateAddress(addressPrefix, wallet, password);

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
  store.dispatch(actions.addWallet(newWallet));

  syncWallet(newWallet);

  return newWallet;
}

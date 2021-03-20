// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";
import * as actions from "@actions/WalletsActions";

import { aesGcmEncrypt } from "@utils/crypto";

import { Wallet, WalletNew, saveWallet, syncWallet, calculateAddress } from "..";
import { broadcastEditWallet } from "@global/StorageBroadcast";

/**
 * Edits a new wallet, encrypting its privatekey and password, saving it to
 * local storage, and dispatching the changes to the Redux store.
 *
 * @param addressPrefix - The prefixes of addresses on this node.
 * @param masterPassword - The master password used to encrypt the wallet
 *   password and privatekey.
 * @param wallet - The old wallet information.
 * @param updated - The new wallet information.
 * @param password - The password of the updated wallet.
 */
export async function editWallet(
  addressPrefix: string,
  masterPassword: string,
  wallet: Wallet,
  updated: WalletNew,
  password: string
): Promise<void> {
  // Calculate the privatekey and address for the given wallet format
  const { privatekey, address } = await calculateAddress(addressPrefix, updated, password);

  // Encrypt the password and privatekey. These will be decrypted on-demand.
  const encPassword = await aesGcmEncrypt(password, masterPassword);
  const encPrivatekey = await aesGcmEncrypt(privatekey, masterPassword);

  const finalWallet = {
    ...wallet,

    label: updated.label?.trim() || "",
    category: updated.category?.trim() || "",

    address,
    username: updated.username,
    encPassword,
    encPrivatekey,
    format: updated.format
  };

  // Save the updated wallet to local storage
  saveWallet(finalWallet);
  broadcastEditWallet(wallet.id); // Broadcast changes to other tabs

  // Dispatch the changes to the redux store
  store.dispatch(actions.updateWallet(wallet.id, finalWallet));

  syncWallet(finalWallet);
}

/**
 * Edits just a wallet's label and category. They can be set to an empty
 * string to be removed, or to `undefined` to use the existing value.
 *
 * @param wallet - The old wallet information.
 * @param label - The new wallet label.
 * @param category - The new wallet category.
 */
export function editWalletLabel(
  wallet: Wallet,
  label: string | "" | undefined,
  category?: string | "" | undefined
): void {
  const updatedLabel = label?.trim() === ""
    ? undefined
    : (label?.trim() || wallet.label);
  const updatedCategory = category?.trim() === ""
    ? undefined
    : (category?.trim() || wallet.category);

  const finalWallet = {
    ...wallet,
    label: updatedLabel,
    category: updatedCategory
  };

  // Save the updated wallet to local storage
  saveWallet(finalWallet);
  broadcastEditWallet(wallet.id); // Broadcast changes to other tabs

  // Dispatch the changes to the redux store
  store.dispatch(actions.updateWallet(wallet.id, finalWallet));

  syncWallet(finalWallet);
}


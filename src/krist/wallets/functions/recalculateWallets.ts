// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";
import * as actions from "@actions/WalletsActions";

import { WalletMap, decryptWallet, saveWallet, calculateAddress } from "..";

import { Mutex } from "async-mutex";

import Debug from "debug";
const debug = Debug("kristweb:wallet");

const recalculationMutex = new Mutex();

/** If the address prefix changes (e.g. swapping sync node), and we are
 * decrypted, recalculate all the addresses with the new prefix. If the prefix
 * is unchanged, this does nothing. The changes will be dispatched to the
 * Redux store. */
export async function recalculateWallets(masterPassword: string, wallets: WalletMap, addressPrefix: string): Promise<void> {
  const lastPrefix = localStorage.getItem("lastAddressPrefix") || "k";
  if (addressPrefix === lastPrefix) return;
  debug("address prefix changed from %s to %s, waiting for mutex...", lastPrefix, addressPrefix);

  // Don't allow more than one recalculation at a time
  await recalculationMutex.runExclusive(async () => {
    const lastPrefix = localStorage.getItem("lastAddressPrefix") || "k";
    if (addressPrefix === lastPrefix) {
      debug("prefix was already reset while we were calculating");
      return;
    }

    debug("recalculating all wallets", lastPrefix, addressPrefix);

    // Map of wallet IDs -> new addresses
    const updatedWallets: Record<string, string> = {};

    // Recalculate all the wallets
    for (const id in wallets) {
      // Prepare the wallet for recalculation
      const wallet = wallets[id];
      const decrypted = await decryptWallet(masterPassword, wallet);
      if (!decrypted)
        throw new Error(`couldn't decrypt wallet ${wallet.id}!`);

      // Calculate the new address
      const { address } = await calculateAddress(addressPrefix, wallet, decrypted.password);

      if (wallet.address === address) continue;

      // Prepare the change to be applied
      debug("old address: %s - new address: %s", wallet.address, address);
      updatedWallets[wallet.id] = address;
    }

    // Now that we know everything converted successfully, save the updated
    // wallets to local storage
    for (const id in wallets) {
      const wallet = wallets[id];
      saveWallet({ ...wallet, address: updatedWallets[wallet.id] });
    }

    // Apply all the changes to the Redux store
    store.dispatch(actions.recalculateWallets(updatedWallets));

    debug("recalculation done, saving prefix");
    localStorage.setItem("lastAddressPrefix", addressPrefix);
  });
}

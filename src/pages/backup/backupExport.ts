// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";

export async function backupExport(): Promise<string> {
  const { salt, tester } = store.getState().masterPassword;
  const { wallets } = store.getState().wallets;

  // Get the wallets, skipping those with dontSave set to true
  const finalWallets = Object.fromEntries(Object.entries(wallets)
    .filter(([_, w]) => w.dontSave !== true));

  const backup = {
    version: 2,

    // Store these to verify the master password is correct when importing
    salt, tester,

    wallets: finalWallets,
    contacts: {} // TODO
  };

  // Convert to base64'd JSON
  const code = window.btoa(JSON.stringify(backup));
  return code;
}

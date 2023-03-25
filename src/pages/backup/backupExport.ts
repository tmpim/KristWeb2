// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";
import { encode } from "js-base64";

declare const __GIT_VERSION__: string;
declare const __PKGBUILD__: string;

export async function backupExport(): Promise<string> {
  const { salt, tester } = store.getState().masterPassword;
  const { wallets } = store.getState().wallets;
  const { contacts } = store.getState().contacts;

  // Get the wallets, skipping those with dontSave set to true
  const finalWallets = Object.fromEntries(Object.entries(wallets)
    .filter(([_, w]) => w.dontSave !== true));

  const gitVersion: string = __GIT_VERSION__;
  const pkgbuild = __PKGBUILD__;

  const backup = {
    version: 2,
    gitVersion,
    pkgbuild,

    // Store these to verify the master password is correct when importing
    salt, tester,

    wallets: finalWallets,
    contacts
  };

  // Convert to base64'd JSON
  return encode(JSON.stringify(backup));
}

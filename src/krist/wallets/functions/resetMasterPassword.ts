// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";

import { getWalletKey } from "@wallets";

export function resetMasterPassword(): void {
  // Remove the master password from local storage
  localStorage.removeItem("salt2");
  localStorage.removeItem("tester2");

  // Find and remove all the wallets
  const wallets = store.getState().wallets.wallets;
  for (const id in wallets) {
    const key = getWalletKey(id);
    localStorage.removeItem(key);
  }

  // Reload the page and return to the dashboard
  location.href = "/";
}

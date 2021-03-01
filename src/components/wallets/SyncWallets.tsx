// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { syncWallets } from "../../krist/wallets/Wallet";
import { useMountEffect } from "../../utils";

/** Sync the wallets with the Krist node on startup. */
export function SyncWallets(): JSX.Element | null {
  // 'wallets' is not a dependency here, we don't want to re-fetch on every
  // wallet update, just the initial startup. We'll leave fetching wallets when
  // the syncNode changes to the WebsocketService.
  useMountEffect(() => {
    // TODO: show errors to the user?
    syncWallets().catch(console.error);
  });

  return null;
}

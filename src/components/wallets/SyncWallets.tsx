import { useState, useEffect } from "react";

import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";

import { syncWallets } from "../../krist/wallets/Wallet";

/** Sync the wallets with the Krist node on startup. */
export function SyncWallets(): JSX.Element | null {
  const { wallets } = useSelector((s: RootState) => s.wallets, shallowEqual);
  const dispatch = useDispatch();

  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (synced) return;
    setSynced(true);

    // TODO: show errors to the user?
    syncWallets(dispatch, wallets).catch(console.error);
  }, [synced]);

  return null;
}

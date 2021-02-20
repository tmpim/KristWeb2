import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";

import { syncWallets } from "../../krist/wallets/Wallet";

/** Sync the wallets with the Krist node on startup. */
export function SyncWallets(): JSX.Element | null {
  const { wallets } = useSelector((s: RootState) => s.wallets);
  const syncNode = useSelector((s: RootState) => s.node.syncNode);
  const dispatch = useDispatch();

  // 'wallets' is not a dependency here, we don't want to re-fetch on every
  // wallet update, just the initial startup
  useEffect(() => {
    // TODO: show errors to the user?
    syncWallets(dispatch, syncNode, wallets).catch(console.error);
  }, [syncNode]);

  return null;
}

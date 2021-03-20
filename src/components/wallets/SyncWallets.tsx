// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect } from "react";
import { message } from "antd";

import { useTranslation } from "react-i18next";

import { syncWallets, useWallets, ADDRESS_LIST_LIMIT } from "@wallets";
import { useMountEffect } from "@utils";

/** Sync the wallets with the Krist node on startup. */
export function SyncWallets(): JSX.Element | null {
  const { t } = useTranslation();

  useMountEffect(() => {
    // TODO: show errors to the user?
    syncWallets().catch(console.error);
  });

  // This is an appropriate place to perform the wallet limit check too. Warn
  // the user if they have more wallets than ADDRESS_LIST_LIMIT; bypassing this
  // limit will generally result in issues with syncing/fetching.
  const { addressList } = useWallets();
  useEffect(() => {
    if (addressList.length > ADDRESS_LIST_LIMIT) {
      message.warning({
        content: t("walletLimitMessage"),
        style: { maxWidth: 512, marginLeft: "auto", marginRight: "auto" }
      });
    }
  }, [t, addressList.length]);

  return null;
}

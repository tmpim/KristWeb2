// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect } from "react";
import { message, notification } from "antd";

import { useSelector } from "react-redux";
import { RootState } from "@store";
import { useTranslation } from "react-i18next";

import { syncWallets, useWallets, ADDRESS_LIST_LIMIT } from "@wallets";
import { useContacts } from "@contacts";

import { criticalError } from "@utils";

import Debug from "debug";
const debug = Debug("kristweb:sync-wallets");

/** Sync the wallets with the Krist node when connected. */
export function SyncWallets(): JSX.Element | null {
  const { t } = useTranslation();

  const connectionState = useSelector((s: RootState) => s.websocket.connectionState);

  // When the websocket connects (usually just on startup), perform the initial
  // sync. This replaces `WebsocketConnection.refreshBalances`.
  useEffect(() => {
    if (connectionState !== "connected") return;
    debug("syncing wallets (ws is %s)", connectionState);
    syncWallets()
      .then(() => debug("synced"))
      .catch(err => {
        criticalError(err);
        notification.error({
          message: t("syncWallets.errorMessage"),
          description: t("syncWallets.errorDescription"),
        });
      });
  }, [t, connectionState]);

  // This is an appropriate place to perform the wallet limit check too. Warn
  // the user if they have more wallets than ADDRESS_LIST_LIMIT; bypassing this
  // limit will generally result in issues with syncing/fetching.
  const { addressList } = useWallets();
  const { contactAddressList } = useContacts();

  useEffect(() => {
    const warningStyle = { style: { maxWidth: 512, marginLeft: "auto", marginRight: "auto" }};

    if (addressList.length > ADDRESS_LIST_LIMIT) {
      message.warning({
        content: t("walletLimitMessage"),
        ...warningStyle
      });
    }

    if (contactAddressList.length > ADDRESS_LIST_LIMIT) {
      message.warning({
        content: t("contactLimitMessage"),
        ...warningStyle
      });
    }
  }, [t, addressList.length, contactAddressList.length]);

  return null;
}

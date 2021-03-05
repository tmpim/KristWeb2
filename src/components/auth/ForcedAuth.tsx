// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { message } from "antd";
import { useTranslation, TFunction } from "react-i18next";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@store";

import { authMasterPassword } from "@wallets/WalletManager";

import { useMountEffect } from "@utils";

async function forceAuth(t: TFunction, salt: string, tester: string): Promise<void> {
  try {
    const password = localStorage.getItem("forcedAuth");
    if (!password) return;

    await authMasterPassword(salt, tester, password);
    message.warning(t("masterPassword.forcedAuthWarning"));
  } catch (e) {
    console.error(e);
  }
}

/** For development purposes, check the presence of a local storage key
 * containing the master password, and automatically authenticate with it. */
export function ForcedAuth(): JSX.Element | null {
  const { isAuthed, hasMasterPassword, salt, tester }
    = useSelector((s: RootState) => s.walletManager, shallowEqual);

  const { t } = useTranslation();

  useMountEffect(() => {
    if (isAuthed || !hasMasterPassword || !salt || !tester) return;
    forceAuth(t, salt, tester);
  });

  return null;
}

import { useState, useEffect } from "react";
import { message } from "antd";
import { useTranslation, TFunction } from "react-i18next";

import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";
import { AppDispatch } from "../../App";

import { authMasterPassword } from "../../krist/wallets/WalletManager";

async function forceAuth(t: TFunction, dispatch: AppDispatch, salt: string, tester: string): Promise<void> {
  try {
    const password = localStorage.getItem("forcedAuth");
    if (!password) return;

    await authMasterPassword(dispatch, salt, tester, password);
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
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const [attemptedAuth, setAttemptedAuth] = useState(false);

  useEffect(() => {
    if (attemptedAuth || isAuthed || !hasMasterPassword || !salt || !tester) return;
    setAttemptedAuth(true);

    forceAuth(t, dispatch, salt, tester);
  }, [attemptedAuth]);

  return null;
}

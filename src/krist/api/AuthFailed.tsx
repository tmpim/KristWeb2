// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, ReactElement } from "react";
import { Modal, Spin, Alert } from "antd";
import { ModalStaticFunctions } from "antd/lib/modal/confirm";

import { useTranslation } from "react-i18next";

import { Wallet, decryptWallet, useMasterPasswordOnly } from "@wallets";

import * as api from "./";

// Used to carry around information on which address failed auth
export class AuthFailedError extends api.APIError {
  constructor(message: string, public address?: string) {
    super(message);
  }
}

export type ShowAuthFailedFn = (wallet: Wallet) => void;

interface AuthFailedModalHookResponse {
  authFailedModal: Omit<ModalStaticFunctions, "warn">;
  authFailedContextHolder: ReactElement;
  showAuthFailed: ShowAuthFailedFn;
}

/**
 * Hook that returns a Modal instance and a contextHolder for it. When the
 * modal is shown, it performs an alert lookup for the given private key,
 * showing the alert if possible, and otherwise a generic 'auth failed'
 * message.
 */
export function useAuthFailedModal(): AuthFailedModalHookResponse {
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();

  // Create the auth failed modal and show it
  function showAuthFailed(wallet: Wallet) {
    modal.error({
      title: t("authFailed.title"),
      content: <ModalContents wallet={wallet} />
    });
  }

  return {
    authFailedModal: modal,
    authFailedContextHolder: contextHolder,
    showAuthFailed
  };
}

interface AlertAPIResponse {
  alert: string;
}

function ModalContents({ wallet }: { wallet: Wallet }): JSX.Element {
  const { t } = useTranslation();

  // The alert from the sync node
  const [alert, setAlert] = useState<string | null>();
  const [loading, setLoading] = useState(true);

  // Needed to decrypt the wallet, as the privatekey is required to get alert
  const masterPassword = useMasterPasswordOnly();

  // Fetch the alert from the sync node (this will usually determine if the
  // address was locked or it's just a collision)
  useEffect(() => {
    if (!masterPassword) return;

    // Errors are generally ignored here, this whole dialog is a very minor
    // edge case that only a few will see.
    (async () => {
      // Decrypt the wallet
      const decrypted = await decryptWallet(masterPassword, wallet);
      if (!decrypted) return; // This should never happen
      const { privatekey } = decrypted;

      // Perform the fetch
      api.post<AlertAPIResponse>("/addresses/alert", { privatekey })
        .then(res => setAlert(res.alert))
        .catch(console.error)
        .finally(() => setLoading(false));
    })().catch(console.error);
  }, [wallet, masterPassword]);

  return <Spin spinning={loading}>
    {alert
      // If there is a known alert from the server, this address is locked, show
      // the alert:
      ? <>
        <p>{t("authFailed.messageLocked")}</p>

        <Alert
          type="error"
          message={t("authFailed.alert")}
          description={alert}
        />
      </>
      // Otherwise, show a generic "You do not own this address." message.
      : t("authFailed.message")}
  </Spin>;
}

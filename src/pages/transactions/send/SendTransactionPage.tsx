// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Button, Alert } from "antd";
import { SendOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { translateError } from "@utils/i18n";

import { PageLayout } from "@layout/PageLayout";

import { useWallets } from "@wallets";
import { NoWalletsResult } from "@comp/results/NoWalletsResult";
import { AuthorisedAction } from "@comp/auth/AuthorisedAction";

import { KristTransaction } from "@api/types";

import { useTransactionForm } from "./SendTransactionForm";
import { NotifSuccessContents, NotifSuccessButton } from "./Success";
import { useSendTxQuery } from "./QueryParamsHook";

import "./SendTransactionPage.less";

export function SendTransactionPage(): JSX.Element {
  // TODO: use this page for pre-filled transaction links?
  const { t } = useTranslation();

  // The success or error alert
  const [alert, setAlert] = useState<JSX.Element | null>(null);

  // Get any pre-filled values from the query parameters
  const { to, amount, metadata } = useSendTxQuery();

  // Create the transaction form
  const { isSubmitting, triggerSubmit, txForm } = useTransactionForm({
    to, amount, metadata,
    onSuccess: tx => setAlert(<AlertSuccess tx={tx} />),
    onError: err => setAlert(<AlertError err={err} />)
  });

  // Don't show the form if there are no wallets.
  const { addressList } = useWallets();
  const hasWallets = addressList?.length > 0;

  function onSubmit() {
    // Close the alert before submission, to forcibly move the form
    setAlert(null);
    triggerSubmit();
  }

  return <PageLayout
    className="send-transaction-page"
    titleKey="sendTransaction.title"
    siteTitleKey="sendTransaction.siteTitle"
  >
    {hasWallets
      ? <>
        {/* Show the success/error alert if available */}
        {alert}

        <div className="send-transaction-container">
          {txForm}

          {/* Send submit button */}
          <AuthorisedAction onAuthed={onSubmit}>
            <Button
              type="primary"
              className="send-transaction-submit"
              icon={<SendOutlined />}
              loading={isSubmitting}

              // Prevent accidental space bar clicks
              onKeyUp={e => e.preventDefault()}
            >
              {t("sendTransaction.buttonSubmit")}
            </Button>
          </AuthorisedAction>

          {/* Clearfix for submit button floated right */}
          <div style={{ clear: "both"}} />
        </div>
      </>
      : <NoWalletsResult type="sendTransaction" />}
  </PageLayout>;
}

function AlertSuccess({ tx }: { tx: KristTransaction }): JSX.Element {
  const { t } = useTranslation();

  return <Alert
    type="success"
    className="send-transaction-alert"
    showIcon
    closable

    message={t("sendTransaction.successNotificationTitle")}
    description={<NotifSuccessContents tx={tx} />}
    action={<NotifSuccessButton tx={tx} />}
  />;
}

function AlertError({ err }: { err: Error }): JSX.Element {
  const { t } = useTranslation();

  return <Alert
    type="error"
    className="send-transaction-alert"
    showIcon
    closable

    message={t("sendTransaction.errorNotificationTitle")}
    description={translateError(t, err, "sendTransaction.errorUnknown")}
  />;
}

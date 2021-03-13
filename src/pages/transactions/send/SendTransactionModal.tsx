// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { Dispatch, SetStateAction } from "react";
import { Modal, Button, notification } from "antd";

import { useTranslation, Trans } from "react-i18next";
import { translateError } from "@utils/i18n";

import { Link } from "react-router-dom";

import { useWallets, Wallet } from "@wallets";
import { NoWalletsModal } from "@comp/results/NoWalletsResult";

import { KristTransaction } from "@api/types";
import { KristValue } from "@comp/krist/KristValue";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";

import { useTransactionForm } from "./SendTransactionForm";

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;

  from?: Wallet | string;
  to?: string;
}

export function SendTransactionModal({
  visible,
  setVisible,
  from,
  to
}: Props): JSX.Element {
  const { t } = useTranslation();

  // Grab a context to display a button in the success notification
  const [notif, contextHolder] = notification.useNotification();

  // Create the transaction form
  const { isSubmitting, triggerSubmit, triggerReset, txForm } = useTransactionForm({
    from,
    to,

    // Display a success notification when the transaction is made
    onSuccess(tx: KristTransaction) {
      notif.success({
        message: t("sendTransaction.successNotificationTitle"),
        description: <NotifSuccessContents tx={tx} />,
        btn: <NotifSuccessButton tx={tx} />
      });

      // Close when done
      closeModal();
    },

    // Display errors as notifications in the modal
    onError: err => notification.error({
      message: t("error"),
      description: translateError(t, err, "sendTransaction.errorUnknown")
    })
  });

  // Don't open the modal if there are no wallets.
  const { addressList } = useWallets();
  const hasWallets = addressList?.length > 0;

  function closeModal() {
    triggerReset();
    setVisible(false);
  }

  return <>
    {hasWallets
      ? (
        <Modal
          visible={visible}

          title={t("sendTransaction.modalTitle")}

          onOk={triggerSubmit}
          okText={t("sendTransaction.modalSubmit")}
          okButtonProps={isSubmitting ? { loading: true } : undefined}

          onCancel={closeModal}
          cancelText={t("dialog.cancel")}
          destroyOnClose
        >
          {txForm}
        </Modal>
      )
      : (
        <NoWalletsModal
          type="sendTransaction"
          visible={visible}
          setVisible={setVisible}
        />
      )
    }

    {/* Context for success notification */}
    {contextHolder}
  </>;
}

function NotifSuccessContents({ tx }: { tx: KristTransaction }): JSX.Element {
  const { t } = useTranslation();

  return <Trans t={t} i18nKey="sendTransaction.successNotificationContent">
    You sent
    <KristValue value={tx.value} />
    from
    <ContextualAddress
      address={tx.from}
      metadata={tx.metadata}
      source
      neverCopyable
    />
    to
    <ContextualAddress
      address={tx.to}
      metadata={tx.metadata}
      neverCopyable
    />
  </Trans>;
}

function NotifSuccessButton({ tx }: { tx: KristTransaction }): JSX.Element {
  const { t } = useTranslation();

  return <Link to={"/network/transactions/" + encodeURIComponent(tx.id)}>
    <Button type="primary">
      {t("sendTransaction.successNotificationButton")}
    </Button>
  </Link>;
}

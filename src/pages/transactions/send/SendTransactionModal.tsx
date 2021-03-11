// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { Dispatch, SetStateAction } from "react";
import { Modal } from "antd";

import { useTranslation } from "react-i18next";

import { useTransactionForm } from "./SendTransactionForm";

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function SendTransactionModal({
  visible, setVisible
}: Props): JSX.Element {
  const { t } = useTranslation();
  const { form, isSubmitting, triggerSubmit, txForm } = useTransactionForm();

  function closeModal() {
    form.resetFields();
    setVisible(false);
  }

  return <Modal
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
  </Modal>;
}

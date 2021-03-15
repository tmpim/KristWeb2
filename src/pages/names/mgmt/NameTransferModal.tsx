// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, Dispatch, SetStateAction } from "react";
import { Modal, Form, notification } from "antd";

import { useTranslation } from "react-i18next";

import { NamePicker } from "./NamePicker";
import { AddressPicker } from "@comp/addresses/picker/AddressPicker";

import awaitTo from "await-to-js";

interface FormValues {
  names: string[];
  recipient: string;
}

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;

  name?: string;
}

export function NameTransferModal({
  visible,
  setVisible,
  name
}: Props): JSX.Element {
  const { t } = useTranslation();

  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);

  // Used to filter out names owned by the recipient
  const [names, setNames] = useState<string[] | undefined>();
  const [recipient, setRecipient] = useState<string | undefined>();

  async function onSubmit() {
    setSubmitting(true);

    // Get the form values
    const [err, values] = await awaitTo(form.validateFields());
    if (err || !values) {
      // Validation errors are handled by the form
      setSubmitting(false);
      return;
    }

    console.log(values);
  }

  function onValuesChange(_: unknown, values: Partial<FormValues>) {
    setNames(values.names || undefined);
    setRecipient(values.recipient || undefined);
  }

  function closeModal() {
    setVisible(false);
    form.resetFields();
    setNames(undefined);
    setRecipient(undefined);
    setSubmitting(false);
  }

  return <Modal
    visible={visible}

    title={t("nameTransfer.modalTitle")}

    onOk={onSubmit}
    okText={t("nameTransfer.buttonSubmit")}
    okButtonProps={submitting ? { loading: true } : undefined}

    onCancel={closeModal}
    cancelText={t("dialog.cancel")}
    destroyOnClose
  >
    <Form
      form={form}
      layout="vertical"
      className="name-transfer-form"

      name="nameTransfer"

      initialValues={{
        names: name ? [name] : undefined
      }}

      onValuesChange={onValuesChange}
      onFinish={onSubmit}
    >
      {/* Names */}
      <NamePicker
        formName="names"
        label={t("nameTransfer.labelNames")}
        tabIndex={1}

        filterOwner={recipient}

        value={names}
        setValue={names => form.setFieldsValue({ names })}

        multiple
        allowAll
      />

      {/* Recipient */}
      <AddressPicker
        name="recipient"
        label={t("nameTransfer.labelRecipient")}
        tabIndex={2}

        noNames
      />
    </Form>
  </Modal>;
}

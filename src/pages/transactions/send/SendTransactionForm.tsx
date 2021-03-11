// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Form, FormInstance } from "antd";

import { useTranslation } from "react-i18next";

import { useWallets } from "@wallets";

import { AddressPicker } from "@comp/addresses/picker/AddressPicker";

export interface FormValues {
  from: string;
  to: string;
  value: number;
  metadata?: string;
}

interface Props {
  form: FormInstance<FormValues>;
  triggerSubmit: () => Promise<void>;
}

function SendTransactionForm({
  form,
  triggerSubmit
}: Props): JSX.Element {
  const { t } = useTranslation();

  // Used to get the initial wallet to show for the 'from' field
  // TODO: Remember this value?
  const { addressList } = useWallets();
  const initialFrom = addressList[0] || "";
  // TODO: initialFrom here should never be an empty string, so need to add a
  //       modal that says "You currently don't have any saved wallets" etc,
  //       and prevents opening the sendTX modal/rendering the page

  return <Form
    // The form instance is managed by the parent, so that it has control over
    // the behaviour of resetting. For example, a modal dialog would want to
    // reset the form values when the modal closes. It gets created by the
    // `useTransactionForm` hook.
    form={form}
    layout="vertical"

    name="sendTransaction"

    initialValues={{
      from: initialFrom,
      to: "",
      value: 1,
      metadata: ""
    }}

    // TODO: onValuesChange={onValuesChange}
    onFinish={triggerSubmit}
  >
    {/* From */}
    <AddressPicker
      walletsOnly
      name="from"
      label={t("sendTransaction.labelFrom")}
      value={form.getFieldValue("from")}
    />

    {/* To */}
    <AddressPicker
      name="to"
      label={t("sendTransaction.labelTo")}
      value={form.getFieldValue("to")}
    />
  </Form>;
}

interface TransactionFormHookResponse {
  form: FormInstance<FormValues>;
  triggerSubmit: () => Promise<void>;
  isSubmitting: boolean;
  txForm: JSX.Element;
}

export function useTransactionForm(): TransactionFormHookResponse {
  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit() {
    setIsSubmitting(true);

    try {
      const values = await form.validateFields();
      console.log(values);
    } finally {
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  }

  // Create the transaction form instance here to be rendered by the caller
  const txForm = <SendTransactionForm
    form={form}
    triggerSubmit={onSubmit}
  />;

  return {
    form,
    triggerSubmit: onSubmit,
    isSubmitting,
    txForm
  };
}

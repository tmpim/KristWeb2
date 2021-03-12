// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useRef } from "react";
import { Row, Col, Form, FormInstance, Input } from "antd";
import { RefSelectProps } from "antd/lib/select";

import { useTranslation } from "react-i18next";

import { useWallets } from "@wallets";
import { useMountEffect } from "@utils";

import { AddressPicker } from "@comp/addresses/picker/AddressPicker";
import { AmountInput } from "./AmountInput";

import "./SendTransactionForm.less";

// This is from https://github.com/tmpim/Krist/blob/a924f3f/src/controllers/transactions.js#L102
// except `+` is changed to `*`.
const METADATA_REGEXP = /^[\x20-\x7F\n]*$/i;

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

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState("");

  // Focus the 'to' input on initial render
  const toRef = useRef<RefSelectProps>(null);
  useMountEffect(() => {
    toRef?.current?.focus();
  });

  function onValuesChange(_: unknown, values: Partial<FormValues>) {
    setFrom(values.from || "");
    setTo(values.to || "");
  }

  return <Form
    // The form instance is managed by the parent, so that it has control over
    // the behaviour of resetting. For example, a modal dialog would want to
    // reset the form values when the modal closes. It gets created by the
    // `useTransactionForm` hook.
    form={form}
    layout="vertical"
    className="send-transaction-form"

    name="sendTransaction"

    initialValues={{
      from: initialFrom,
      to: "",
      value: 1,
      metadata: ""
    }}

    onValuesChange={onValuesChange}
    onFinish={triggerSubmit}
  >
    <Row gutter={16}>
      {/* From */}
      <Col span={24} md={12}>
        <AddressPicker
          walletsOnly
          name="from"
          label={t("sendTransaction.labelFrom")}
          value={from}
          tabIndex={1}
        />
      </Col>

      {/* To */}
      <Col span={24} md={12}>
        <AddressPicker
          name="to"
          label={t("sendTransaction.labelTo")}
          value={to}
          otherPickerValue={from === undefined ? initialFrom : from}
          tabIndex={2}
          inputRef={toRef}
        />
      </Col>
    </Row>

    {/* Amount */}
    <AmountInput
      from={from === undefined ? initialFrom : from}
      setValue={value => form.setFieldsValue({ value })}
      tabIndex={3}
    />

    {/* Metadata */}
    <Form.Item
      name="metadata"
      label={t("sendTransaction.labelMetadata")}
      rules={[
        { max: 255, message: t("sendTransaction.errorMetadataTooLong") },
        { pattern: METADATA_REGEXP,
          message: t("sendTransaction.errorMetadataInvalid") },
      ]}
    >
      <Input.TextArea
        className="input-monospace"
        rows={3}
        placeholder={t("sendTransaction.placeholderMetadata")}
        tabIndex={4}
      />
    </Form.Item>
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

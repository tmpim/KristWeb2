// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useRef } from "react";
import { Row, Col, Form, FormInstance, Input, Modal } from "antd";
import { RefSelectProps } from "antd/lib/select";

import { useTranslation, Trans } from "react-i18next";
import { TranslatedError } from "@utils/i18n";

import { useWallets, useMasterPasswordOnly, Wallet } from "@wallets";
import { useMountEffect } from "@utils";

import { APIError } from "@api";
import { KristTransaction } from "@api/types";
import { makeTransaction } from "@api/transactions";
import { useAuthFailedModal } from "@api/AuthFailed";

import { AddressPicker } from "@comp/addresses/picker/AddressPicker";
import { AmountInput } from "./AmountInput";
import { KristValue } from "@comp/krist/KristValue";

import awaitTo from "await-to-js";

import "./SendTransactionForm.less";

// This is from https://github.com/tmpim/Krist/blob/a924f3f/src/controllers/transactions.js#L102
// except `+` is changed to `*`.
const METADATA_REGEXP = /^[\x20-\x7F\n]*$/i;

export interface FormValues {
  from: string;
  to: string;
  amount: number;
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
      amount: 1,
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
      setAmount={amount => form.setFieldsValue({ amount })}
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

interface TransactionFormHookProps {
  onError?: (err: Error) => void;
  onSuccess?: (transaction: KristTransaction) => void;
}

interface TransactionFormHookResponse {
  form: FormInstance<FormValues>;
  triggerSubmit: () => Promise<void>;
  triggerReset: () => void;
  isSubmitting: boolean;
  txForm: JSX.Element;
}

export function useTransactionForm({
  onError,
  onSuccess
}: TransactionFormHookProps = {}): TransactionFormHookResponse {
  const { t } = useTranslation();

  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Used to check for warning on large transactions
  const { walletAddressMap } = useWallets();
  // Used to decrypt the wallet to make the transaction
  const masterPassword = useMasterPasswordOnly();

  // Confirmation modal used for when the transaction amount is very large.
  // This is created here to provide a translation context for the modal.
  const [confirmModal, contextHolder] = Modal.useModal();
  // Modal used when auth fails
  const { showAuthFailed, authFailedContextHolder } = useAuthFailedModal();

  // Called when the modal is closed
  function onReset() {
    form.resetFields();
    setIsSubmitting(false);
  }

  // Take the form values and known wallet and submit the transaction
  async function submitTransaction(
    { to, amount, metadata }: FormValues,
    wallet: Wallet
  ): Promise<void> {
    if (!masterPassword)
      throw new TranslatedError("sendTransaction.errorWalletDecrypt");

    // API errors will be bubbled up to the caller
    const tx = await makeTransaction(
      masterPassword,
      wallet,
      to,
      amount,
      metadata
    );

    onSuccess?.(tx);
  }

  // Convert API errors to friendlier errors
  function handleError(err: Error, from?: Wallet): void {
    // Construct a TranslatedError pre-keyed to sendTransaction
    const tErr = (key: string) => new TranslatedError("sendTransaction." + key);

    switch (err.message) {
    case "missing_parameter":
    case "invalid_parameter":
      switch ((err as APIError).parameter) {
      case "to":
        return onError?.(tErr("errorParameterTo"));
      case "amount":
        return onError?.(tErr("errorParameterAmount"));
      case "metadata":
        return onError?.(tErr("errorParameterMetadata"));
      }
      break;
    case "insufficient_funds":
      return onError?.(tErr("errorInsufficientFunds"));
    case "name_not_found":
      return onError?.(tErr("errorNameNotFound"));
    case "auth_failed":
      return showAuthFailed(from!);
    }

    // Pass through any other unknown errors
    onError?.(err);
  }

  async function onSubmit() {
    setIsSubmitting(true);

    // Get the form values
    const [err, values] = await awaitTo(form.validateFields());
    if (err || !values) {
      // Validation errors are handled by the form
      setIsSubmitting(false);
      return;
    }

    // Find the wallet we're trying to pay from, and verify it actually exists
    // and has a balance (shouldn't happen)
    const currentWallet = walletAddressMap[values.from];
    if (!currentWallet)
      throw new TranslatedError("sendTransaction.errorWalletGone");
    if (!currentWallet.balance)
      throw new TranslatedError("sendTransaction.errorAmountTooHigh");

    // If the transaction is large (over half the balance), prompt for
    // confirmation before sending
    const { amount } = values;
    const isLarge = amount >= currentWallet.balance / 2;
    if (isLarge) {
      // It's large, prompt for confirmation
      confirmModal.confirm({
        title: t("sendTransaction.modalTitle"),
        content: (
          // Show the appropriate message, if this is just over half the
          // balance, or if it is the entire balance.
          <Trans
            t={t}
            i18nKey={amount >= currentWallet.balance
              ? "sendTransaction.payLargeConfirmAll"
              : "sendTransaction.payLargeConfirmHalf"}
          >
            Are you sure you want to send <KristValue value={amount} />?
            This is over half your balance!
          </Trans>
        ),

        // Transaction looks OK, submit it
        okText: t("sendTransaction.buttonSubmit"),
        onOk: () => submitTransaction(values, currentWallet)
          .catch(err => handleError(err, currentWallet))
          .finally(() => setIsSubmitting(false)),

        cancelText: t("dialog.cancel"),
        onCancel: () => setIsSubmitting(false)
      });
    } else {
      // Transaction looks OK, submit it
      submitTransaction(values, currentWallet)
        .catch(err => handleError(err, currentWallet))
        .finally(() => setIsSubmitting(false));
    }
  }

  // Create the transaction form instance here to be rendered by the caller
  const txForm = <>
    <SendTransactionForm
      form={form}
      triggerSubmit={onSubmit}
    />

    {/* Give the modals somewhere to find the context from. */}
    {contextHolder}
    {authFailedContextHolder}
  </>;

  return {
    form,
    triggerSubmit: onSubmit,
    triggerReset: onReset,
    isSubmitting,
    txForm
  };
}

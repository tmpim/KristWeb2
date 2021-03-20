// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useRef } from "react";
import { Row, Col, Form, FormInstance, Input, Modal } from "antd";
import { RefSelectProps } from "antd/lib/select";

import { useTranslation, Trans } from "react-i18next";
import { TranslatedError } from "@utils/i18n";

import { useSelector, useDispatch } from "react-redux";
import { store } from "@app";
import { RootState } from "@store";
import { setLastTxFrom } from "@actions/WalletsActions";

import { useWallets, Wallet } from "@wallets";
import { useMountEffect } from "@utils";

import { APIError } from "@api";
import { KristTransaction } from "@api/types";
import { makeTransaction } from "@api/transactions";
import { useAuthFailedModal } from "@api/AuthFailed";

import { AddressPicker } from "@comp/addresses/picker/AddressPicker";
import { AmountInput } from "./AmountInput";
import { KristValue } from "@comp/krist/KristValue";

import awaitTo from "await-to-js";

import Debug from "debug";
const debug = Debug("kristweb:send-transaction-form");

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
  from?: Wallet | string;
  to?: string;
  form: FormInstance<FormValues>;
  triggerSubmit: () => Promise<void>;
}

function SendTransactionForm({
  from: rawInitialFrom,
  to: initialTo,
  form,
  triggerSubmit
}: Props): JSX.Element {
  const { t } = useTranslation();

  // Get the initial wallet to show for the 'from' field. Use the provided
  // wallet if we were given one, otherwise use the saved 'last wallet',
  // or the first wallet we can find.
  const initialFromAddress = typeof rawInitialFrom === "string"
    ? rawInitialFrom : rawInitialFrom?.address;

  const { addressList, walletAddressMap } = useWallets();
  const firstWallet = addressList[0];

  // Validate the lastTxFrom wallet still exists
  const dispatch = useDispatch();
  const lastTxFrom = useSelector((s: RootState) => s.wallets.lastTxFrom);
  const lastTxFromAddress = lastTxFrom && addressList.includes(lastTxFrom)
    ? lastTxFrom : undefined;

  const initialFrom = initialFromAddress || lastTxFromAddress || firstWallet;

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  // Focus the 'to' input on initial render
  const toRef = useRef<RefSelectProps>(null);
  useMountEffect(() => {
    toRef?.current?.focus();
  });

  function onValuesChange(
    changed: Partial<FormValues>,
    values: Partial<FormValues>
  ) {
    setFrom(values.from || "");
    setTo(values.to || "");

    // Update and save the lastTxFrom so the next time the modal is opened
    // it will remain on this address
    if (changed.from) {
      const currentWallet = walletAddressMap[changed.from];
      if (currentWallet && currentWallet.address !== lastTxFromAddress) {
        debug("updating lastTxFrom to %s", currentWallet.address);
        dispatch(setLastTxFrom(currentWallet));
        localStorage.setItem("lastTxFrom", currentWallet.address);
      }
    }
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
      to: initialTo,
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
          form={form} // Used to perform the self-name checks
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
  from?: Wallet | string;
  to?: string;
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
  from: initialFrom,
  to: initialTo,
  onError,
  onSuccess
}: TransactionFormHookProps = {}): TransactionFormHookResponse {
  const { t } = useTranslation();

  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Used to check for warning on large transactions
  const { walletAddressMap } = useWallets();

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
    // Manually get the master password from the store state, because this might
    // get called immediately after an auth, which doesn't give the hook time to
    // update this submitTransaction function. The password here is used to
    // decrypt the wallet to make the transaction.
    const masterPassword = store.getState().masterPassword.masterPassword;
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
    const [err2, currentWallet] = await awaitTo((async () => {
      const currentWallet = walletAddressMap[values.from];
      if (!currentWallet)
        throw new TranslatedError("sendTransaction.errorWalletGone");
      if (!currentWallet.balance)
        throw new TranslatedError("sendTransaction.errorAmountTooHigh");

      return currentWallet;
    })());

    // Push out any errors with the wallet
    if (err2 || !currentWallet?.balance) {
      onError?.(err2!);
      setIsSubmitting(false);
      return;
    }

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
      from={initialFrom}
      to={initialTo}
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

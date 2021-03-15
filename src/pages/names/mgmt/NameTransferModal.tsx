// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, Dispatch, SetStateAction } from "react";
import { Modal, Form, notification } from "antd";

import { useTranslation, Trans } from "react-i18next";
import { TranslatedError, translateError } from "@utils/i18n";

import {
  useWallets, useMasterPasswordOnly,
  decryptAddresses, DecryptErrorGone, DecryptErrorFailed,
  ValidDecryptedAddresses
} from "@wallets";
import { NameOption, fetchNames } from "./lookupNames";
import { useNameSuffix } from "@utils/currency";

import { APIError } from "@api";
import { transferNames } from "@api/names";
import { useAuthFailedModal, AuthFailedError } from "@api/AuthFailed";

import { NamePicker } from "./NamePicker";
import { AddressPicker } from "@comp/addresses/picker/AddressPicker";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";

import awaitTo from "await-to-js";
import { groupBy } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:name-transfer-modal");

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

  // Confirmation modal used for when sending multiple names.
  // This is created here to provide a translation context for the modal.
  const [confirmModal, contextHolder] = Modal.useModal();
  // Modal used when auth fails
  const { showAuthFailed, authFailedContextHolder } = useAuthFailedModal();
  // Context for translation in the success notification
  const [notif, notifContextHolder] = notification.useNotification();

  // Used to fetch the list of available names
  const { walletAddressMap } = useWallets();
  const nameSuffix = useNameSuffix();
  // Used to decrypt the wallets for transfer
  const masterPassword = useMasterPasswordOnly();

  // Actually perform the bulk name transfer
  async function handleSubmit(names: NameOption[], recipient: string) {
    if (!masterPassword) return;
    debug("submitting with names %o", names);

    // Attempt to decrypt each wallet. Group the names by wallet to create a
    // LUT of decrypted privatekeys.
    const nameOwners = names.map(n => n.owner);
    const decryptResults = await decryptAddresses(
      masterPassword, walletAddressMap, nameOwners
    );

    // Check if there were any decryption errors
    if (Object.values(decryptResults).includes(DecryptErrorGone))
      throw new TranslatedError("nameTransfer.errorWalletGone");

    const decryptFailed = Object.entries(decryptResults)
      .find(([_, r]) => r === DecryptErrorFailed);
    if (decryptFailed) {
      throw new Error(t(
        "nameTransfer.errorWalletDecrypt",
        { address: decryptFailed[0] }
      ));
    }

    // Finally perform the transfer
    await transferNames(
      // We've already validated the names
      decryptResults as ValidDecryptedAddresses,
      names.map(n => ({ name: n.key, owner: n.owner })),
      recipient
    );


    // Success! Show notification and close modal
    const count = names.length;

    notif.success({
      message: t("nameTransfer.successMessage", { count }),
      description: <SuccessNotifContent
        count={count}
        recipient={recipient}
      />
    });

    setSubmitting(false);
    closeModal();
  }

  // Convert API errors to friendlier errors
  function handleError(err: Error) {
    // Construct a TranslatedError pre-keyed to nameTransfer
    const tErr = (key: string) => new TranslatedError("nameTransfer." + key);
    const onError = (err: Error) => notification.error({
      message: t("nameTransfer.errorNotificationTitle"),
      description: translateError(t, err, "nameTransfer.errorUnknown")
    });

    switch (err.message) {
    case "missing_parameter":
    case "invalid_parameter":
      switch ((err as APIError).parameter) {
      case "name":
        return onError(tErr("errorParameterNames"));
      case "address":
        return onError(tErr("errorParameterRecipient"));
      }
      break;
    case "name_not_found":
      return onError(tErr("errorNameNotFound"));
    case "not_name_owner":
      return onError(tErr("errorNotNameOwner"));
    case "auth_failed":
      return showAuthFailed(walletAddressMap[(err as AuthFailedError).address!]);
    }

    // Pass through any other unknown errors
    console.error(err);
    onError(err);
  }

  // Validate the form and consolidate all the data before submission
  async function onSubmit() {
    setSubmitting(true);

    // Get the form values
    const [err, values] = await awaitTo(form.validateFields());
    if (err || !values) {
      // Validation errors are handled by the form
      setSubmitting(false);
      return;
    }

    // Convert the desired names to a lookup table
    const { names, recipient } = values;
    const namesLUT = names
      .reduce((out, name) => {
        out[name] = true;
        return out;
      }, {} as Record<string, boolean>);

    // Lookup the names list one last time, to associate the name owners
    // to the wallets for decryption, and to show the correct confirmation
    // modal.
    const nameGroups = await fetchNames(t, nameSuffix, walletAddressMap);
    if (!nameGroups) {
      // This shouldn't happen, but if the owner suddenly has no names anymore,
      // show an error.
      notification.error({
        message: t("nameTransfer.errorNotifTitle"),
        description: t("nameTransfer.errorNameRequired")
      });
      setSubmitting(false);
      return;
    }

    // Filter out names owned by the recipient, just in case.
    const filteredNameGroups = nameGroups
      .filter(g => g.wallet.address !== recipient);

    // The names from filteredNameGroups that we actually want to transfer
    const allNames = filteredNameGroups.flatMap(g => g.names);
    const filteredNames = allNames.filter(n => !!namesLUT[n.key]);

    // All the names owned by the wallets, used for the confirmation modal.
    const allNamesCount = allNames.length;
    const count = filteredNames.length;

    // If sending multiple names, prompt for confirmation
    if (count > 1) {
      confirmModal.confirm({
        title: t("nameTransfer.modalTitle"),
        content: <ConfirmModalContent
          count={count}
          allNamesCount={allNamesCount}
          recipient={recipient}
        />,

        okText: t("nameTransfer.buttonSubmit"),
        onOk: () => {
          // Don't return this promise, so the dialog closes immediately
          handleSubmit(filteredNames, recipient)
            .catch(handleError)
            .finally(() => setSubmitting(false));
        },

        cancelText: t("dialog.cancel"),
        onCancel: () => setSubmitting(false)
      });
    } else {
      handleSubmit(filteredNames, recipient)
        .catch(handleError)
        .finally(() => setSubmitting(false));
    }
  }

  function onValuesChange(_: unknown, values: Partial<FormValues>) {
    setNames(values.names || undefined);
    setRecipient(values.recipient || undefined);
  }

  function closeModal() {
    // Don't allow closing the modal while submitting
    if (submitting) return;

    setVisible(false);
    form.resetFields();
    setNames(undefined);
    setRecipient(undefined);
  }

  const modal = <Modal
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
        suppressUpdates={submitting}

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

        value={recipient}
        suppressUpdates={submitting}

        noNames
        nameHint
      />
    </Form>
  </Modal>;

  return <>
    {modal}

    {/* Give the modals somewhere to find the context from. This is done
      * outside of the modal so that they don't get immediately destroyed when
      * the modal closes. */}
    {contextHolder}
    {authFailedContextHolder}
    {notifContextHolder}
  </>;
}

interface CountRecipient {
  count: number;
  recipient: string;
}

function ConfirmModalContent({
  count,
  recipient,
  allNamesCount
}: CountRecipient & { allNamesCount: number }): JSX.Element {
  const { t } = useTranslation();

  // Show the appropriate message, if this is all the owner's names
  return <Trans
    t={t}
    i18nKey={count >= allNamesCount
      ? "nameTransfer.warningAllNames"
      : "nameTransfer.warningMultipleNames"}
    count={count}
  >
    Are you sure you want to transfer <b>{{ count }}</b> names to
    <ContextualAddress address={recipient} />?
  </Trans>;
}

function SuccessNotifContent({
  count,
  recipient
}: CountRecipient): JSX.Element {
  const { t } = useTranslation();

  // Show the appropriate message, if this is all the owner's names
  return <Trans
    t={t}
    i18nKey={"nameTransfer.successDescription"}
    count={count}
  >
    Transferred <b>{{ count }}</b> names to
    <ContextualAddress address={recipient} />.
  </Trans>;
}

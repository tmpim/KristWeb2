// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { Modal, Form, Input, Typography, Button, notification } from "antd";

import { Trans } from "react-i18next";
import { useTFns } from "@utils/i18n";

import { useSelector } from "react-redux";
import { RootState } from "@store";
import { store } from "@app";

import { Link } from "react-router-dom";

import { useWallets, Wallet } from "@wallets";
import {
  useNameSuffix, BARE_NAME_REGEX, MAX_NAME_LENGTH, isValidName
} from "@utils/currency";

import { checkName } from "./checkName";
import { handlePurchaseError } from "./handleErrors";
import { purchaseName } from "@api/names";
import { useAuthFailedModal } from "@api/AuthFailed";

import { KristValue } from "@comp/krist/KristValue";
import { AddressPicker } from "@comp/addresses/picker/AddressPicker";

import awaitTo from "await-to-js";
import { throttle } from "lodash-es";

const { Text } = Typography;

interface FormValues {
  address: string;
  name: string;
}

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

const CHECK_THROTTLE = 300;

export function NamePurchaseModal({
  visible,
  setVisible
}: Props): JSX.Element {
  const tFns = useTFns("namePurchase.");
  const { t, tStr, tKey, tErr } = tFns;

  const [form] = Form.useForm();

  // Used to perform extra validation
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>();
  const checkNameAvailable =
    useMemo(() => throttle(checkName, CHECK_THROTTLE, { leading: true }), []);

  // Modal used when auth fails
  const { showAuthFailed, authFailedContextHolder } = useAuthFailedModal();
  // Context for translation in the success notification
  const [notif, notifContextHolder] = notification.useNotification();

  // Used to format the form and determine whether or not the name can be
  // afforded by the chosen wallet
  const nameSuffix = useNameSuffix();
  const nameCost = useSelector((s: RootState) => s.node.constants.name_cost);

  const { walletAddressMap } = useWallets();

  // Used to show the validate message if the name can't be afforded
  const canAffordName = (walletAddressMap[address]?.balance || 0) >= nameCost;

  // Look up name availability when the input changes
  useEffect(() => {
    setNameAvailable(undefined);

    if (name && isValidName(name))
      checkNameAvailable(name, setNameAvailable);
  }, [name, checkNameAvailable]);

  // Take the form values and known wallet and purchase the name
  async function handleSubmit(wallet: Wallet, name: string): Promise<void> {
    const masterPassword = store.getState().masterPassword.masterPassword;
    if (!masterPassword) throw tErr("errorWalletDecrypt");

    // Verify the name can be afforded once again
    if ((wallet.balance || 0) < nameCost)
      throw tErr("errorInsufficientFunds");

    // Perform the purchase
    await purchaseName(masterPassword, wallet, name);

    // Success! Show notification and close modal
    notif.success({
      message: t(tKey("successMessage")),
      btn: <NotifSuccessButton name={name} />
    });

    setSubmitting(false);
    closeModal();
  }

  async function onSubmit() {
    setSubmitting(true);

    // Get the form values
    const [err, values] = await awaitTo(form.validateFields());
    if (err || !values) {
      // Validation errors are handled by the form
      setSubmitting(false);
      return;
    }
    const { address, name } = values;

    // Fetch the wallet from the address field and verify it actually exists
    const currentWallet = walletAddressMap[address];
    if (!currentWallet) throw tErr("errorWalletGone");

    // Begin the purchase
    handleSubmit(currentWallet, name)
      .catch(err =>
        handlePurchaseError(tFns, showAuthFailed, currentWallet, err))
      .finally(() => setSubmitting(false));
  }

  function onValuesChange(values: Partial<FormValues>) {
    setAddress(values.address || "");
    setName(values.name || "");
  }

  function closeModal() {
    form.resetFields();
    setVisible(false);
    setAddress("");
    setName("");
    setSubmitting(false);
    setNameAvailable(undefined);
  }

  const modal = <Modal
    visible={visible}

    title={tStr("modalTitle")}

    onOk={onSubmit}
    okText={<Trans t={t} i18nKey={tKey("buttonSubmit")}>
      Purchase (<KristValue value={nameCost} />)
    </Trans>}
    okButtonProps={submitting ? { loading: true } : undefined}

    onCancel={closeModal}
    cancelText={t("dialog.cancel")}
    destroyOnClose
  >
    <Form
      form={form}
      layout="vertical"

      name="namePurchase"

      onValuesChange={onValuesChange}
      onFinish={onSubmit}
    >
      {/* Name cost */}
      <div className="name-purchase-cost" style={{ marginBottom: 24 }}>
        <Trans t={t} i18nKey={tKey("nameCost")}>
          Cost to purchase: <KristValue long value={nameCost} />
        </Trans>
      </div>

      {/* Wallet/address */}
      <AddressPicker
        name="address"
        label={tStr("labelWallet")}

        // Show a message if the name can't be afforded
        validateStatus={address && !canAffordName
          ? "error" : undefined}
        help={address && !canAffordName
          ? tStr("errorInsufficientFunds") : undefined}

        value={address}
        walletsOnly={true}
      />

      {/* Name */}
      <Form.Item
        label={tStr("labelName")}
        required
      >
        <Input.Group compact style={{ display: "flex" }}>
          <Form.Item
            name="name"
            style={{ flex: 1, marginBottom: 0}}

            // Show feedback for name validity
            validateStatus={nameAvailable === false
              ? "error"
              : (nameAvailable ? "success" : undefined)}
            help={nameAvailable === false
              // Name taken
              ? <Text type="danger">{tStr("errorNameTaken")}</Text>
              : (nameAvailable
                // Name available
                ? <span className="text-green">
                  {tStr("nameAvailable")}
                </span>
                : undefined)}

            validateFirst
            rules={[
              { required: true, message: tStr("errorNameRequired") },
              { max: MAX_NAME_LENGTH, message: tStr("errorNameTooLong") },
              { pattern: BARE_NAME_REGEX, message: tStr("errorInvalidName") },
            ]}
          >
            <Input
              placeholder={tStr("placeholderName")}
              maxLength={MAX_NAME_LENGTH}
            />
          </Form.Item>

          <span className="ant-input-group-addon kw-fake-addon name-suffix">
            .{nameSuffix}
          </span>
        </Input.Group>
      </Form.Item>
    </Form>
  </Modal>;

  return <>
    {modal}

    {authFailedContextHolder}
    {notifContextHolder}
  </>;
}

export function NotifSuccessButton({ name }: { name: string }): JSX.Element {
  const { tStr } = useTFns("namePurchase.");

  return <Link to={"/network/names/" + encodeURIComponent(name)}>
    <Button type="primary">
      {tStr("successNotificationButton")}
    </Button>
  </Link>;
}

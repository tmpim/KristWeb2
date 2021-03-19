// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useRef, useEffect, useCallback } from "react";
import { Modal, Form, Input, Checkbox, Collapse, Button, Tooltip, Typography, Row, Col, message, notification, Grid } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { useTranslation, Trans } from "react-i18next";

import { generatePassword } from "@utils";
import { useAddressPrefix } from "@utils/currency";

import { FakeUsernameInput } from "@comp/auth/FakeUsernameInput";
import { CopyInputButton } from "@comp/CopyInputButton";
import { SelectWalletCategory } from "@comp/wallets/SelectWalletCategory";

import { SelectWalletFormat } from "@comp/wallets/SelectWalletFormat";
import {
  Wallet, WalletFormatName, calculateAddress, formatNeedsUsername,
  useWallets, addWallet, decryptWallet, editWallet, ADDRESS_LIST_LIMIT,
  useMasterPasswordOnly
} from "@wallets";

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface FormValues {
  label?: string;
  category: string;

  walletUsername: string;
  password: string;
  format: WalletFormatName;

  save: boolean;
}

interface Props {
  create?: boolean;
  editing?: Wallet;

  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setAddExistingVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddWalletModal({ create, editing, visible, setVisible, setAddExistingVisible }: Props): JSX.Element {
  if (editing && create)
    throw new Error("AddWalletModal: 'editing' and 'create' simultaneously, uh oh!");

  const initialFormat = editing?.format || "kristwallet";

  // Required to encrypt new wallets
  const masterPassword = useMasterPasswordOnly();
  // Required to check for existing wallets
  const { wallets } = useWallets();
  const addressPrefix = useAddressPrefix();

  const { t } = useTranslation();
  const bps = useBreakpoint();

  const [form] = Form.useForm<FormValues>();
  const passwordInput = useRef<Input>(null);
  const [calculatedAddress, setCalculatedAddress] = useState<string | undefined>();
  const [formatState, setFormatState] = useState<WalletFormatName>(initialFormat);

  function closeModal() {
    form.resetFields(); // Make sure to generate another password on re-open
    setCalculatedAddress(undefined);
    setVisible(false);
  }

  function addExistingWallet() {
    if (!setAddExistingVisible) return;
    setAddExistingVisible(true);
    closeModal();
  }

  async function onSubmit() {
    if (!masterPassword) return notification.error({
      message: t("addWallet.errorUnexpectedTitle"),
      description: t("masterPassword.errorNoPassword")
    });

    const values = await form.validateFields();
    if (!values.password) return;

    try {
      if (editing) { // Edit wallet
        // Double check the destination wallet exists
        if (!wallets[editing.id]) return notification.error({
          message: t("addWallet.errorMissingWalletTitle"),
          description: t("addWallet.errorMissingWalletDescription")
        });

        // If the address changed, check that a wallet doesn't already exist
        // with this address
        if (editing.address !== calculatedAddress
          && Object.values(wallets).find(w => w.address === calculatedAddress)) {
          return notification.error({
            message: t("addWallet.errorDuplicateWalletTitle"),
            description: t("addWallet.errorDuplicateWalletDescription")
          });
        }

        await editWallet(addressPrefix, masterPassword, editing, values, values.password);
        message.success(t("addWallet.messageSuccessEdit"));

        closeModal();
      } else { // Add/create wallet
        // Check if we reached the wallet limit
        if (Object.keys(wallets).length >= ADDRESS_LIST_LIMIT) {
          return notification.error({
            message: t("addWallet.errorWalletLimitTitle"),
            description: t("addWallet.errorWalletLimitDescription")
          });
        }

        // Check if the wallet already exists
        if (Object.values(wallets).find(w => w.address === calculatedAddress)) {
          return notification.error({
            message: t("addWallet.errorDuplicateWalletTitle"),
            description: t("addWallet.errorDuplicateWalletDescription")
          });
        }

        await addWallet(addressPrefix, masterPassword, values, values.password, values.save ?? true);
        message.success(create ? t("addWallet.messageSuccessCreate") : t("addWallet.messageSuccessAdd"));

        closeModal();
      }
    } catch (err) {
      console.error(err);
      notification.error({
        message: t("addWallet.errorUnexpectedTitle"),
        description: editing
          ? t("addWallet.errorUnexpectedEditDescription")
          : t("addWallet.errorUnexpectedDescription")
      });
    }
  }

  function onValuesChange(changed: Partial<FormValues>, values: Partial<FormValues>) {
    if (changed.format) setFormatState(changed.format);

    if ((changed.format || changed.password || changed.walletUsername) && values.password)
      updateCalculatedAddress(values.format, values.password, values.walletUsername);
  }

  /** Update the 'Wallet address' field */
  const updateCalculatedAddress = useCallback(async function(format: WalletFormatName | undefined, password: string, username?: string) {
    const { address } = await calculateAddress(addressPrefix, format, password, username);
    setCalculatedAddress(address);
  }, [addressPrefix]);

  const generateNewPassword = useCallback(function() {
    if (!create || !form) return;
    const password = generatePassword();
    form.setFieldsValue({ password });
    updateCalculatedAddress("kristwallet", password);
  }, [create, form, updateCalculatedAddress]);

  useEffect(() => {
    if (visible && form && !form.getFieldValue("password")) {
      // Generate a password when the 'Create wallet' modal is opened
      if (create) generateNewPassword();

      // Populate the password when the 'Edit wallet' modal is opened
      if (editing && masterPassword) {
        (async () => {
          const dec = await decryptWallet(masterPassword, editing);
          if (!dec) return notification.error({
            message: t("addWallet.errorDecryptTitle"),
            description: t("addWallet.errorDecryptDescription")
          });

          const password = dec.password;
          form.setFieldsValue({ password });
          updateCalculatedAddress(form.getFieldValue("format"), password);
        })();
      }
    }
  }, [t, generateNewPassword, updateCalculatedAddress, masterPassword, visible, form, create, editing]);

  return <Modal
    visible={visible}

    title={t(editing
      ? "addWallet.dialogTitleEdit"
      : (create ? "addWallet.dialogTitleCreate" : "addWallet.dialogTitle"))}

    footer={[
      /* Add existing wallet button */
      create && bps.sm && (
        <Button key="addExisting" onClick={addExistingWallet} style={{ float: "left" }}>
          {t("addWallet.dialogAddExisting")}
        </Button>
      ),

      /* Cancel button */
      <Button key="cancel" onClick={closeModal}>
        {t("dialog.cancel")}
      </Button>,

      /* OK button */
      <Button key="ok" type="primary" onClick={onSubmit}>
        {t(editing
          ? "addWallet.dialogOkEdit"
          : (create ? "addWallet.dialogOkCreate" : "addWallet.dialogOkAdd"))}
      </Button>,
    ]}

    onCancel={closeModal}
    destroyOnClose
  >
    <Form
      form={form}
      layout="vertical"

      name={editing
        ? "editWalletForm"
        : (create ? "createWalletForm" : "addWalletForm")}

      initialValues={{
        label: editing?.label ?? undefined,
        category: editing?.category ?? "",

        username: editing?.username ?? undefined,

        format: editing?.format ?? initialFormat,
        save: true
      }}

      onValuesChange={onValuesChange}
    >
      <Row gutter={[24, 0]}>
        {/* Wallet label */}
        <Col span={12}>
          <Form.Item
            name="label"
            label={t("addWallet.walletLabel")}
            rules={[
              { max: 32, message: t("addWallet.walletLabelMaxLengthError") },
              { whitespace: true, message: t("addWallet.walletLabelWhitespaceError") }
            ]}
          >
            <Input placeholder={t("addWallet.walletLabelPlaceholder")} />
          </Form.Item>
        </Col>

        {/* Wallet category */}
        <Col span={12}>
          <Form.Item name="category" label={t("addWallet.walletCategory")}>
            <SelectWalletCategory
              onNewCategory={category => form.setFieldsValue({ category })}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Fake username input to trick browser autofill */}
      <FakeUsernameInput />

      {/* Wallet username, if applicable */}
      {formatState && formatNeedsUsername(formatState) && (
        <Form.Item name="walletUsername" label={t("addWallet.walletUsername")}>
          <Input type="text" autoComplete="off" placeholder={t("addWallet.walletUsernamePlaceholder")}/>
        </Form.Item>
      )}

      {/* Wallet password */}
      <Form.Item
        label={formatState === "api"
          ? t("addWallet.walletPrivatekey")
          : t("addWallet.walletPassword")}
        style={{ marginBottom: 0 }}
      >
        <Input.Group compact style={{ display: "flex" }}>
          <Form.Item
            name="password"
            style={{ flex: 1, marginBottom: 0 }}
            rules={[
              {
                required: true,
                message: formatState === "api"
                  ? t("addWallet.errorPrivatekeyRequired")
                  : t("addWallet.errorPasswordRequired")
              }
            ]}
          >
            <Input
              ref={passwordInput}
              type={create ? "text" : "password"}
              readOnly={!!create}
              autoComplete="off"

              className={create ? "input-monospace" : ""}
              style={{ height: 32 }}

              placeholder={formatState === "api"
                ? t("addWallet.walletPrivatekeyPlaceholder")
                : t("addWallet.walletPasswordPlaceholder")}
            />
          </Form.Item>

          {create && <>
            <CopyInputButton targetInput={passwordInput} />

            <Tooltip title={t("addWallet.walletPasswordRegenerate")}>
              <Button icon={<ReloadOutlined />} onClick={generateNewPassword} />
            </Tooltip>
          </>}
        </Input.Group>
      </Form.Item>
      {/* Password save warning */}
      {create && <Text className="text-small" type="danger"><Trans t={t} i18nKey="addWallet.walletPasswordWarning">
        Make sure to save this somewhere <b>secure</b>!
      </Trans></Text>}

      {/* Calculated address */}
      <Form.Item label={t("addWallet.walletAddress")} style={{ marginTop: 24, marginBottom: 0 }}>
        <Input type="text" readOnly value={calculatedAddress} />
      </Form.Item>

      {/* Advanced options */}
      {!create && <Collapse ghost className="flush-collapse" style={{ marginTop: 24 }}>
        <Collapse.Panel forceRender header={t("addWallet.advancedOptions")} key="1">
          {/* Wallet format */}
          <Form.Item name="format" label={t("addWallet.walletFormat")}>
            {SelectWalletFormat({ initialFormat })}
          </Form.Item>

          {/* Save in KristWeb checkbox */}
          {!editing && <Form.Item name="save" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>{t("addWallet.walletSave")}</Checkbox>
          </Form.Item>}
        </Collapse.Panel>
      </Collapse>}
    </Form>
  </Modal>;
}

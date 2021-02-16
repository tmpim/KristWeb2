import React, { useState, useRef, useEffect } from "react";
import { Modal, Form, Input, Checkbox, Collapse, Select, Button, Tooltip, Typography, Row, Col } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

import { useTranslation, Trans } from "react-i18next";

import { generatePassword } from "../../utils";

import { FakeUsernameInput } from "../../components/auth/FakeUsernameInput";
import { CopyInputButton } from "../../components/CopyInputButton";
import { getWalletCategoryDropdown } from "../../components/wallets/WalletCategoryDropdown";
import { WalletFormatName, applyWalletFormat } from "../../krist/wallets/formats/WalletFormat";
import { makeV2Address } from "../../krist/AddressAlgo";

const { Text } = Typography;

interface FormValues {
  label?: string;
  category: string;

  password: string;
  format: WalletFormatName;

  save: boolean;
}

interface Props {
  create?: boolean;

  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddWalletModal({ create, visible, setVisible }: Props): JSX.Element {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormValues>();
  const passwordInput = useRef<Input>(null);
  const [calculatedAddress, setCalculatedAddress] = useState<string | undefined>();

  async function onSubmit() {
    const values = await form.validateFields();
    console.log(values);

    form.resetFields(); // Make sure to generate another password on re-open
    setVisible(false);
  }

  function onValuesChange(changed: Partial<FormValues>, values: Partial<FormValues>) {
    if ((changed.format || changed.password) && values.password)
      updateCalculatedAddress(values.format, values.password);
  }

  /** Update the 'Wallet address' field */
  async function updateCalculatedAddress(format: WalletFormatName | undefined, password: string) {
    const privatekey = await applyWalletFormat(format || "kristwallet", password);
    const address = await makeV2Address(privatekey);
    setCalculatedAddress(address);
  }

  function generateNewPassword() {
    if (!create || !form) return;
    const password = generatePassword();
    form.setFieldsValue({ password });
    updateCalculatedAddress("kristwallet", password);
  }

  // Generate a password when the modal is opened
  useEffect(() => {
    if (create && visible && form && !form.getFieldValue("password")) {
      generateNewPassword();
    }
  }, [create, visible, form]);

  return <Modal
    visible={visible}

    title={t(create ? "addWallet.dialogTitleCreate" : "addWallet.dialogTitle")}
    okText={t(create ? "addWallet.dialogOkCreate" : "addWallet.dialogOkAdd")}
    cancelText={t("dialog.cancel")}

    onCancel={() => { form.resetFields(); setVisible(false); }}
    onOk={onSubmit}
  >
    <Form
      form={form}
      layout="vertical"
      name={create ? "createWalletForm" : "addWalletForm"}

      initialValues={{
        category: "",
        format: "kristwallet",
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
          >
            <Input placeholder={t("addWallet.walletLabelPlaceholder")} />
          </Form.Item>
        </Col>

        {/* Wallet category */}
        <Col span={12}>
          <Form.Item
            name="category"
            label={t("addWallet.walletCategory")}
          >
            {getWalletCategoryDropdown({ onNewCategory: category => form.setFieldsValue({ category })})}
          </Form.Item>
        </Col>
      </Row>


      {/* Fake username input to trick browser autofill */}
      <FakeUsernameInput />

      {/* Wallet password */}
      <Form.Item label={t("addWallet.walletPassword")} style={{ marginBottom: 0 }}>
        <Input.Group compact style={{ display: "flex" }}>
          <Form.Item name="password" style={{ flex: 1, marginBottom: 0 }}>
            <Input
              ref={passwordInput}
              type={create ? "text" : "password"}
              readOnly={!!create}
              autoComplete="off"

              className={create ? "input-monospace" : ""}
              style={{ height: 32 }}

              placeholder={t("addWallet.walletPasswordPlaceholder")}
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
        <Collapse.Panel header={t("addWallet.advancedOptions")} key="1">
          {/* Wallet format */}
          <Form.Item name="format" label={t("addWallet.walletFormat")}>
            <Select>
              <Select.Option value="kristwallet">{t("addWallet.walletFormatKristWallet")}</Select.Option>
              <Select.Option value="api">{t("addWallet.walletFormatApi")}</Select.Option>
            </Select>
          </Form.Item>

          {/* Save in KristWeb checkbox */}
          <Form.Item name="save" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>{t("addWallet.walletSave")}</Checkbox>
          </Form.Item>
        </Collapse.Panel>
      </Collapse>}
    </Form>
  </Modal>;
}

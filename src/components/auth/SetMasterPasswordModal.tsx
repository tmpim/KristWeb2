import React, { useRef } from "react";
import { Modal, Form, Input, Button } from "antd";
import { useTranslation, Trans } from "react-i18next";
import { useDispatch } from "react-redux";

import { getMasterPasswordInput, FakeUsernameInput } from "./MasterPasswordInput";

import { setMasterPassword } from "../../krist/WalletManager";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function SetMasterPasswordModal({ visible, onCancel, onSubmit }: Props): JSX.Element {
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const [form] = Form.useForm();
  const inputRef = useRef<Input>(null);

  async function onFinish() {
    const values = await form.validateFields();
    form.resetFields();

    await setMasterPassword(dispatch, values.masterPassword);

    onSubmit();
  }

  return <Modal
    title={t("masterPassword.dialogTitle")}

    visible={visible}
    destroyOnClose

    onCancel={() => { form.resetFields(); onCancel(); }}
    onOk={onFinish}
  >
    <p>
      <Trans t={t} i18nKey="masterPassword.intro2">
        Enter a <b>master password</b> to encrypt your wallet privatekeys. They
        will be saved in your browser&apos;s local storage, and you will be
        asked for the master password to decrypt them once per session.
      </Trans>
    </p>

    <Form
      form={form}
      name="setMasterPassword"
      layout="vertical"
      onFinish={onFinish}
    >
      <FakeUsernameInput />

      {/* Password input */}
      <Form.Item
        name="masterPassword"
        rules={[
          { required: true, message: t("masterPassword.errorPasswordRequired") },
          { min: 0, message: t("masterPassword.errorPasswordLength") },
        ]}
        style={{ marginBottom: 8 }}
      >
        {getMasterPasswordInput({ inputRef, placeholder: t("masterPassword.passwordPlaceholder"), autoFocus: true })}
      </Form.Item>

      {/* Password confirm input */}
      <Form.Item
        name="masterPasswordConfirm"
        dependencies={["masterPassword"]}
        rules={[
          { required: true, message: t("masterPassword.errorPasswordRequired") },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("masterPassword") === value)
                return Promise.resolve();
              return Promise.reject(t("masterPassword.errorPasswordInequal"));
            }
          })
        ]}
        style={{ marginBottom: 0 }}
      >
        {getMasterPasswordInput({ placeholder: t("masterPassword.passwordConfirmPlaceholder"), tabIndex: 2 })}
      </Form.Item>

      {/* Ghost submit button to make 'enter' work */}
      <Button htmlType="submit" hidden />
    </Form>
  </Modal>;
}

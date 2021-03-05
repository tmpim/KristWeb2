// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useRef } from "react";
import { Modal, Form, Input, Button } from "antd";
import { useTranslation, Trans } from "react-i18next";

import { FakeUsernameInput } from "./FakeUsernameInput";
import { getMasterPasswordInput } from "./MasterPasswordInput";

import { setMasterPassword } from "@wallets/WalletManager";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function SetMasterPasswordModal({ visible, onCancel, onSubmit }: Props): JSX.Element {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const inputRef = useRef<Input>(null);

  async function onFinish() {
    const values = await form.validateFields();
    form.resetFields();

    await setMasterPassword(values.masterPassword);

    onSubmit();
  }

  return <Modal
    title={t("masterPassword.dialogTitle")}
    okText={t("dialog.ok")}
    cancelText={t("dialog.cancel")}

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

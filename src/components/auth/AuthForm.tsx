// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useMemo, useCallback, Ref } from "react";
import { Button, Input, Form } from "antd";

import { useTFns, translateError } from "@utils/i18n";

import { FakeUsernameInput } from "./FakeUsernameInput";
import { getMasterPasswordInput } from "./MasterPasswordInput";

import { authMasterPassword, useMasterPassword } from "@wallets";

interface FormValues {
  masterPassword: string;
}

interface AuthFormRes {
  form: JSX.Element;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useAuthForm(
  encrypt: boolean | undefined,
  onSubmit: () => void,
  inputRef: Ref<Input>
): AuthFormRes {
  const { t, tStr, tKey } = useTFns("masterPassword.");

  const { salt, tester } = useMasterPassword();

  const [form] = Form.useForm<FormValues>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const reset = useCallback(() => {
    form.resetFields();
  }, [form]);

  const onFinish = useCallback(async function() {
    const values = await form.validateFields();

    try {
      await authMasterPassword(salt, tester, values.masterPassword);
      onSubmit();
    } catch (err) {
      setPasswordError(translateError(t, err, tKey("errorUnknown")));
    }
  }, [t, tKey, onSubmit, salt, tester, form]);

  const formEl = useMemo(() => <>
    <p>{tStr(encrypt ? "popoverDescriptionEncrypt" : "popoverDescription")}</p>

    <Form
      form={form}
      name="authMasterPassword"
      layout="vertical"
      onFinish={onFinish}
    >
      <FakeUsernameInput />

      {/* Password input */}
      <Form.Item
        name="masterPassword"

        hasFeedback={passwordError !== undefined}
        validateStatus={passwordError !== undefined ? "error" : undefined}
        help={passwordError}

        rules={[
          { required: true, message: tStr("errorPasswordRequired") },
          { min: 0, message: tStr("errorPasswordLength") },
        ]}

        style={{ marginBottom: 8 }}
      >
        {getMasterPasswordInput({
          inputRef,
          placeholder: tStr("passwordPlaceholder"),
          autoFocus: true
        })}
      </Form.Item>

      {/* Fake submit button to allow the enter key to submit in modal */}
      <Button htmlType="submit" style={{ display: "none" }} />
    </Form>
  </>, [tStr, inputRef, encrypt, form, onFinish, passwordError]);

  return { form: formEl, submit: onFinish, reset };
}

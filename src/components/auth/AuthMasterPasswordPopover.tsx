// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useRef, useCallback, FC, Ref } from "react";
import { Popover, Button, Input, Form } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";

import { useTFns, translateError } from "@utils/i18n";

import { FakeUsernameInput } from "./FakeUsernameInput";
import { getMasterPasswordInput } from "./MasterPasswordInput";

import { authMasterPassword, useMasterPassword } from "@wallets";

interface FormValues {
  masterPassword: string;
}

interface Props {
  encrypt?: boolean;
  onSubmit: () => void;
  placement?: TooltipPlacement;
}

export const AuthMasterPasswordPopover: FC<Props> = ({
  encrypt,
  onSubmit,
  placement,
  children
}) => {
  const { tStr } = useTFns("masterPassword.");

  const inputRef = useRef<Input>(null);

  const onVisibleChange = useCallback(() =>
    setTimeout(() => inputRef.current?.focus(), 20), [inputRef]);

  return <Popover
    trigger="click"
    overlayClassName="authorised-action-popover"
    title={tStr(encrypt ? "popoverTitleEncrypt" : "popoverTitle")}
    placement={placement}
    onVisibleChange={onVisibleChange}
    content={() => <AuthForm
      encrypt={encrypt}
      onSubmit={onSubmit}
      inputRef={inputRef}
    />}
  >
    {children}
  </Popover>;
};

interface AuthFormProps {
  encrypt?: boolean;
  onSubmit: () => void;
  inputRef: Ref<Input>;
}

function AuthForm({
  encrypt,
  onSubmit,
  inputRef
}: AuthFormProps): JSX.Element {
  const { t, tStr, tKey } = useTFns("masterPassword.");

  const { salt, tester } = useMasterPassword();

  const [form] = Form.useForm();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  const onFinish = useCallback(async function(values: FormValues) {
    try {
      await authMasterPassword(salt, tester, values.masterPassword);
      onSubmit();
    } catch (err) {
      setPasswordError(translateError(t, err, tKey("errorUnknown")));
    }
  }, [t, tKey, onSubmit, salt, tester]);

  return <>
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
          { required: true, message: t("masterPassword.errorPasswordRequired") },
          { min: 0, message: t("masterPassword.errorPasswordLength") },
        ]}

        style={{ marginBottom: 8 }}
      >
        {getMasterPasswordInput({
          inputRef,
          placeholder: t("masterPassword.passwordPlaceholder"),
          autoFocus: true
        })}
      </Form.Item>

      {/* Submit button */}
      <Button type="primary" htmlType="submit" size="small">
        {t("masterPassword.popoverAuthoriseButton")}
      </Button>
    </Form>
  </>;
}

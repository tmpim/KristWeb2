// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useRef, FC } from "react";
import { Popover, Button, Input, Form } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@store";
import { useTranslation } from "react-i18next";
import { translateError } from "@utils/i18n";

import { FakeUsernameInput } from "./FakeUsernameInput";
import { getMasterPasswordInput } from "./MasterPasswordInput";

import { authMasterPassword } from "@wallets";

interface FormValues {
  masterPassword: string;
}

interface Props {
  encrypt?: boolean;
  onSubmit: () => void;
  placement?: TooltipPlacement;
}

export const AuthMasterPasswordPopover: FC<Props> = ({ encrypt, onSubmit, placement, children }) => {
  const { salt, tester } = useSelector((s: RootState) => s.masterPassword, shallowEqual);

  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const inputRef = useRef<Input>(null);

  async function onFinish(values: FormValues) {
    try {
      await authMasterPassword(salt, tester, values.masterPassword);
      onSubmit();
    } catch (err) {
      setPasswordError(translateError(t, err, "masterPassword.errorUnknown"));
    }
  }

  return <Popover
    trigger="click"
    overlayClassName="authorised-action-popover"
    title={t(encrypt ? "masterPassword.popoverTitleEncrypt" : "masterPassword.popoverTitle")}
    placement={placement}
    onVisibleChange={visible => {
      if (visible) setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 20);
    }}
    content={<>
      <p>{t(encrypt ? "masterPassword.popoverDescriptionEncrypt" : "masterPassword.popoverDescription")}</p>

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
          {getMasterPasswordInput({ inputRef, placeholder: t("masterPassword.passwordPlaceholder"), autoFocus: true })}
        </Form.Item>

        <Button type="primary" htmlType="submit" size="small">{t("masterPassword.popoverAuthoriseButton")}</Button>
      </Form>
    </>}
  >
    {children}
  </Popover>;
};

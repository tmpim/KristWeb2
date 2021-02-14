import { useState, useRef, FunctionComponent } from "react";
import { Popover, Button, Input, Form } from "antd";
import { useTranslation } from "react-i18next";

import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";

import { getMasterPasswordInput, FakeUsernameInput } from "./MasterPasswordInput";

import { authMasterPassword } from "../../krist/WalletManager";

interface FormValues {
  masterPassword: string;
}

interface Props {
  onSubmit: () => void;
}

export const AuthMasterPasswordPopover: FunctionComponent<Props> = ({ onSubmit, children }) => {
  const { salt, tester } = useSelector((s: RootState) => s.walletManager, shallowEqual);
  const dispatch = useDispatch();

  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const inputRef = useRef<Input>(null);

  async function onFinish(values: FormValues) {
    try {
      await authMasterPassword(dispatch, salt, tester, values.masterPassword);
      onSubmit();
    } catch (e) {
      const message = e.message // Translate the error if we can
        ? e.message.startsWith("masterPassword.") ? t(e.message) : e.message
        : t("masterPassword.errorUnknown");

      setPasswordError(message);
    }
  }

  return <Popover
    trigger="click"
    overlayClassName="authorised-action-popover"
    title={t("masterPassword.popoverTitle")}
    onVisibleChange={visible => {
      if (visible) setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 20);
    }}
    content={<>
      <p>{t("masterPassword.popoverDescription")}</p>

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
  </Popover>
}

import { FunctionComponent, useRef } from "react";
import { Popover, Input, Button } from "antd";
import { useTranslation } from "react-i18next";

import "./AuthorisedAction.less";

interface Props {

}

export const AuthorisedAction: FunctionComponent<Props> = ({ children }) => {
  const { t } = useTranslation();
  const inputRef = useRef<Input>(null);

  return <Popover
    trigger="click"
    overlayClassName="authorised-action-popover"
    title={t("masterPassword.popoverTitle")}
    onVisibleChange={visible => {
      if (visible) setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 20);
    }}
    content={<>
      <p>{t("masterPassword.popoverDescription")}</p>

      {/* Fake username field to trick autofill */}
      <Input
        type="username"
        id="username" name="username"
        value="Master password" /* Do not translate */
        style={{ position: "absolute", pointerEvents: "none", opacity: 0 }}
      />

      <Input
        type="password"
        placeholder={t("masterPassword.passwordPlaceholder")}
        autoComplete="off"
        tabIndex={1}
        autoFocus={true}
        ref={inputRef}
      />

      <Button type="primary" size="small">{t("masterPassword.popoverAuthoriseButton")}</Button>
    </>}
  >
    {children}
  </Popover>;
};

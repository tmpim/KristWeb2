import React from "react";
import { Input } from "antd";

interface Props {
  inputRef?: React.Ref<Input>;
  placeholder: string;
  tabIndex?: number;
  autoFocus?: boolean;
}

/// Fake username field for master password inputs, to trick autofill.
export function FakeUsernameInput() {
  return <Input
    type="username"
    id="username" name="username"
    value="Master password" /* Do not translate */
    style={{ position: "absolute", pointerEvents: "none", opacity: 0 }}
  />
}

export function getMasterPasswordInput({ inputRef, placeholder, tabIndex, autoFocus }: Props) {
  return <Input
    type="password"
    placeholder={placeholder}
    autoComplete="off"
    tabIndex={tabIndex !== undefined ? tabIndex : 1}
    autoFocus={autoFocus}
    ref={inputRef}
  />
}

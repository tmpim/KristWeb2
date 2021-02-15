import React from "react";
import { Input } from "antd";

interface Props {
  inputRef?: React.Ref<Input>;
  placeholder: string;
  tabIndex?: number;
  autoFocus?: boolean;
}

export function getMasterPasswordInput({ inputRef, placeholder, tabIndex, autoFocus }: Props): JSX.Element {
  return <Input
    type="password"
    placeholder={placeholder}
    autoComplete="off"
    tabIndex={tabIndex !== undefined ? tabIndex : 1}
    autoFocus={autoFocus}
    ref={inputRef}
  />;
}

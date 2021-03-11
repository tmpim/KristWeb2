// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
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

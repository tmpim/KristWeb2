import React from "react";
import { Input } from "antd";

/// Fake username field for master password inputs, to trick autofill.
export function FakeUsernameInput(): JSX.Element {
  return <Input
    type="username"
    id="username" name="username"
    value="Master password" /* Do not translate */
    style={{ position: "absolute", pointerEvents: "none", opacity: 0 }}
  />;
}

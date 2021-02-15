import React, { useState } from "react";
import { Tooltip, Button, ButtonProps, Input } from "antd";
import { CopyOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

type Props = ButtonProps & {
  targetInput: React.RefObject<Input>;
  refocusButton?: boolean;
}

export function CopyInputButton({ targetInput, refocusButton, ...buttonProps }: Props): JSX.Element {
  const { t } = useTranslation();
  const [showCopied, setShowCopied] = useState(false);

  function copy(e: React.MouseEvent<HTMLButtonElement>) {
    if (!targetInput.current) return;

    targetInput.current.select();
    document.execCommand("copy");

    if (refocusButton === undefined || refocusButton) {
      e.currentTarget.focus();
    }

    setShowCopied(true);
  }

  return <Tooltip
    title={showCopied ? t("copied") : t("copy")}
    color={showCopied ? "green" : undefined}
    onVisibleChange={visible => {
      if (!visible && showCopied) setShowCopied(false);
    }}
  >
    <Button icon={<CopyOutlined />} onClick={copy} {...buttonProps} />
  </Tooltip>;
}

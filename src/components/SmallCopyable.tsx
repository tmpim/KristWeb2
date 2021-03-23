// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { Tooltip } from "antd";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { CopyConfig } from "./types";
import copy from "copy-to-clipboard";

import "./SmallCopyable.less";

// This is based on the ant Typography copyable, but with some features removed,
// and without the overhead of the Typography Base component. The ResizeObserver
// in Typography seems to add a significant amount to render times when there
// are a lot of Text elements on the screen (for example, a table listing).

// Force 'text' to be set (don't traverse the children at all)
type Props = CopyConfig & {
  text: string;
  className?: string;
};

export function SmallCopyable({ text, onCopy, className }: Props): JSX.Element {
  const { t } = useTranslation();

  const [copied, setCopied] = useState(false);
  const copyId = useRef<number>();

  function onCopyClick(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();

    copy(text);

    // Display the 'Copied!' tooltip for 3 secs
    setCopied(true);
    onCopy?.();
    copyId.current = window.setTimeout(() => setCopied(false), 3000);
  }

  // Clear the timeout on unmount
  useEffect(() => () => window.clearTimeout(copyId.current), []);

  const title = copied ? t("copied") : t("copy");
  const classes = classNames(className, "ant-typography-copy", "small-copyable",
    copied && "ant-typography-copy-success");

  const btn = (
    <div
      role="button"
      onClick={onCopyClick}
      aria-label={title}
      className={classes}
    >
      {copied ? <CheckOutlined /> : <CopyOutlined />}
    </div>
  );

  return copied
    ? <Tooltip title={title}>{btn}</Tooltip>
    : btn;
}

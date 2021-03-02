// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import classNames from "classnames";
import { Typography } from "antd";

import { useBooleanSetting } from "../../utils/settings";

import "./BlockHash.less";

const { Text } = Typography;

interface Props {
  hash: string;
  neverCopyable?: boolean;
  className?: string;
}

export function BlockHash({ hash, neverCopyable, className }: Props): JSX.Element {
  const blockHashCopyButtons = useBooleanSetting("blockHashCopyButtons");

  const copyable = !neverCopyable && blockHashCopyButtons
    ? true : undefined;

  const classes = classNames("block-hash", className);

  return <Text className={classes} copyable={copyable}>
    {hash}
  </Text>;
}

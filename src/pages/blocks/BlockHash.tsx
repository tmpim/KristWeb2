// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";
import { Typography } from "antd";

import { useBooleanSetting } from "@utils/settings";

import "./BlockHash.less";

const { Text } = Typography;

const SHORT_HASH_LENGTH = 12;

interface Props {
  hash?: string | null;
  alwaysCopyable?: boolean;
  neverCopyable?: boolean;
  className?: string;
}

export function BlockHash({ hash, alwaysCopyable, neverCopyable, className }: Props): JSX.Element | null {
  const blockHashCopyButtons = useBooleanSetting("blockHashCopyButtons");

  if (hash === undefined || hash === null) return null;

  // If the hash is longer than 12 characters (i.e. it's not just a short hash
  // on its own), then split it into two parts, so the short hash can be
  // highlighted. Otherwise, just put the whole hash in restHash.
  const shortHash = hash.length > SHORT_HASH_LENGTH
    ? hash.substr(0, SHORT_HASH_LENGTH) : "";
  const restHash = hash.length > SHORT_HASH_LENGTH
    ? hash.substring(SHORT_HASH_LENGTH, hash.length) : hash;

  const copyable = alwaysCopyable || (!neverCopyable && blockHashCopyButtons)
    ? { text: hash } : undefined;

  const classes = classNames("block-hash", className);

  return <Text className={classes} copyable={copyable}>
    {shortHash && <span className="block-hash-short-part">{shortHash}</span>}
    <span className="block-hash-rest-part">{restHash}</span>
  </Text>;
}

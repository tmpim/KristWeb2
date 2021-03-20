// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";
import { Typography } from "antd";
import { CopyConfig } from "./types";

import { useTranslation } from "react-i18next";

import "./OptionalField.less";

const { Text } = Typography;

interface Props {
  value?: React.ReactNode | null | undefined;
  copyable?: boolean | CopyConfig;
  unsetKey?: string;
  className?: string;
}

export function OptionalField({
  value,
  copyable,
  unsetKey,
  className
}: Props): JSX.Element {
  const { t } = useTranslation();

  const unset = value === undefined || value === null;
  const classes = classNames("optional-field", className, {
    "optional-field-unset": unset
  });

  return <span className={classes}>
    {unset
      ? t(unsetKey || "optionalFieldUnset")
      : <Text copyable={copyable}>{value}</Text>}
  </span>;
}

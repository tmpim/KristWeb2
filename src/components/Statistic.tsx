// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import classNames from "classnames";

import { useTranslation } from "react-i18next";

import "./Statistic.less";

interface Props {
  title?: string;
  titleKey?: string;
  value?: React.ReactNode;

  className?: string;
  green?: boolean;
}

export function Statistic({ title, titleKey, value, className, green }: Props): JSX.Element {
  const { t } = useTranslation();

  const classes = classNames("kw-statistic", className, {
    "kw-statistic-green": green
  });

  return <div className={classes}>
    <span className="kw-statistic-title">{titleKey ? t(titleKey) : title}</span>
    <span className="kw-statistic-value">{value}</span>
  </div>;
}

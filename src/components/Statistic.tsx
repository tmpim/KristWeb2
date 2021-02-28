// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";

import { useTranslation } from "react-i18next";

import "./Statistic.less";

interface Props {
  title?: string;
  titleKey?: string;
  value?: React.ReactNode;
}

export function Statistic({ title, titleKey, value }: Props): JSX.Element {
  const { t } = useTranslation();

  return <div className="kw-statistic">
    <span className="kw-statistic-title">{titleKey ? t(titleKey) : title}</span>
    <span className="kw-statistic-value">{value}</span>
  </div>;
}

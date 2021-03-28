// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";

import { useTranslation } from "react-i18next";

import "./styles/Statistic.less";

interface Props {
  title?: string;
  titleKey?: string;
  titleExtra?: React.ReactNode;
  value?: React.ReactNode;

  className?: string;
  green?: boolean;
}

export function Statistic({ title, titleKey, titleExtra, value, className, green }: Props): JSX.Element {
  const { t } = useTranslation();

  const classes = classNames("kw-statistic", className, {
    "kw-statistic-green": green
  });

  return <div className={classes}>
    <span className="kw-statistic-title">{titleKey ? t(titleKey) : title}{titleExtra}</span>
    <span className="kw-statistic-value">{value}</span>
  </div>;
}

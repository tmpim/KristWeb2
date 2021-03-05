// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import classNames from "classnames";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { KristSymbol } from "./KristSymbol";

import "./KristValue.less";

interface OwnProps {
  value?: number;
  long?: boolean;
  hideNullish?: boolean;
  green?: boolean;
  highlightZero?: boolean;
}
type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

export const KristValue = ({ value, long, hideNullish, green, highlightZero, ...props }: Props): JSX.Element | null => {
  const currencySymbol = useSelector((s: RootState) => s.node.currency.currency_symbol);

  if (hideNullish && (value === undefined || value === null)) return null;

  const classes = classNames("krist-value", props.className, {
    "krist-value-green": green,
    "krist-value-zero": highlightZero && value === 0
  });

  return (
    <span {...props} className={classes}>
      {(currencySymbol || "KST") === "KST" && <KristSymbol />}
      <span className="krist-value-amount">{(value || 0).toLocaleString()}</span>
      {long && <span className="krist-currency-long">{currencySymbol || "KST"}</span>}
    </span>
  );
};

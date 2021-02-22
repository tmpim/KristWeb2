import React from "react";

import { useSelector } from "react-redux";
import { RootState } from "../store";

import { KristSymbol } from "./KristSymbol";

import "./KristValue.less";

interface OwnProps {
  value?: number;
  long?: boolean;
  hideNullish?: boolean;
  green?: boolean;
};

type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

export const KristValue = ({ value, long, hideNullish, green, ...props }: Props): JSX.Element | null => {
  const currencySymbol = useSelector((s: RootState) => s.node.currency.currency_symbol);

  if (hideNullish && (value === undefined || value === null)) return null;

  return (
    <span {...props} className={"krist-value " + (green ? "krist-value-green " : "") + (props.className || "")}>
      {(currencySymbol || "KST") === "KST" && <KristSymbol />}
      <span className="krist-value-amount">{(value || 0).toLocaleString()}</span>
      {long && <span className="krist-currency-long">{currencySymbol || "KST"}</span>}
    </span>
  );
};

import React from "react";

import { KristSymbol } from "./KristSymbol";

import "./KristValue.less";

interface OwnProps {
  value?: number;
  long?: boolean;
};

type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

export const KristValue = ({ value, long, ...props }: Props) => (
  <span {...props} className={"krist-value " + (props.className || "")}>
    <KristSymbol />
    <span className="krist-value-amount">{(value || 0).toLocaleString()}</span>
    {long && <span className="krist-currency-long">KST</span>}
  </span>
);

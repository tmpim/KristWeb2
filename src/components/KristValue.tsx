import React from "react";

import { KristSymbol } from "./KristSymbol";

import "./KristValue.less";

interface OwnProps {
  value?: number;
  long?: boolean;
  hideNullish?: boolean;
  green?: boolean;
};

type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

export const KristValue = ({ value, long, hideNullish, green, ...props }: Props): JSX.Element | null =>
  hideNullish && (value === undefined || value === null)
    ? null
    : (
      <span {...props} className={"krist-value " + (green ? "krist-value-green " : "") + (props.className || "")}>
        <KristSymbol />
        <span className="krist-value-amount">{(value || 0).toLocaleString()}</span>
        {long && <span className="krist-currency-long">KST</span>}
      </span>
    );

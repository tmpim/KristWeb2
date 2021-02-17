import React from "react";

import { KristSymbol } from "./KristSymbol";

import "./KristValue.less";

interface OwnProps {
  value?: number;
  long?: boolean;
  hideNullish?: boolean;
};

type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

export const KristValue = ({ value, long, hideNullish, ...props }: Props): JSX.Element | null =>
  hideNullish && (value === undefined || value === null)
    ? null
    : (
      <span {...props} className={"krist-value " + (props.className || "")}>
        <KristSymbol />
        <span className="krist-value-amount">{(value || 0).toLocaleString()}</span>
        {long && <span className="krist-currency-long">KST</span>}
      </span>
    );

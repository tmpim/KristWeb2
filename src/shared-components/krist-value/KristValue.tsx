import React from "react";

import "./KristValue.scss";

interface OwnProps {
  value: number;
  long?: boolean;
};

type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

export const KristValue = ({ value, long, ...props }: Props): JSX.Element => (
  <span {...props} className={"krist-value" + (" " + props.className || "")}>
    <span className="icon-krist"></span>
    <span className="krist-value-amount">{value.toLocaleString()}</span>
    {long && <span className="krist-currency-long">KST</span>}
  </span>
);

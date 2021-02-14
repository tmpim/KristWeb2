import React, { HTMLProps } from "react";

import "./Flag.css";

interface Props extends HTMLProps<HTMLSpanElement> {
  name?: string;
  code?: string;
}

export function Flag({ name, code, ...rest }: Props): JSX.Element {
  return <span
    className={"flag " + (code ? "flag-" + code.toLowerCase() : "")}
    title={name}
    {...rest}
  ></span>;
}

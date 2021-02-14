import { HTMLProps } from "react";

import "./Flag.less";

interface Props extends HTMLProps<HTMLSpanElement> {
  name?: string;
  code?: string;
}

export function Flag({ name, code, ...rest }: Props) {
  return <span
    className={"flag " + (code ? "flag-" + code.toLowerCase() : "")}
    title={name || "Unknown Location"}
    {...rest}
  ></span>;
}

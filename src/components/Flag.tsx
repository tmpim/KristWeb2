// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { HTMLProps } from "react";
import classNames from "classnames";

import "./Flag.css";

interface Props extends HTMLProps<HTMLSpanElement> {
  name?: string;
  code?: string;
}

export function Flag({ name, code, className, ...rest }: Props): JSX.Element {
  const classes = classNames(
    "flag",
    code ? "flag-" + code.toLowerCase() : "",
    className
  );

  return <span
    className={classes}
    title={name}
    {...rest}
  ></span>;
}

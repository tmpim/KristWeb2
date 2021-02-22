// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
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

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import classNames from "classnames";

import { useSelector } from "react-redux";
import { RootState } from "../store";

import { Link } from "react-router-dom";

interface OwnProps {
  name: string;
  noLink?: boolean;
}
type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

export function KristNameLink({ name, noLink, ...props }: Props): JSX.Element | null {
  const nameSuffix = useSelector((s: RootState) => s.node.currency.name_suffix);

  if (!name) return null;

  const contents = `${name}.${nameSuffix}`;
  const classes = classNames("krist-name", props.className);

  return <span className={classes}>
    {noLink
      ? contents
      : <Link to={"/network/names/" + encodeURIComponent(name)}>{contents}</Link>}
  </span>;
}

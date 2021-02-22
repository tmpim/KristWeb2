// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";

import { useSelector } from "react-redux";
import { RootState } from "../store";

import { Link } from "react-router-dom";

interface Props {
  name: string;
  className?: string;
}

export function KristName({ name, className }: Props): JSX.Element {
  const nameSuffix = useSelector((s: RootState) => s.node.currency.name_suffix);

  return <span className={"krist-name " + (className || "")}>
    <Link to={"/network/names/" + encodeURIComponent(name)}>
      {name}.{nameSuffix}
    </Link>
  </span>;
}

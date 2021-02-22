import React from "react";

import { Link } from "react-router-dom";

interface Props {
  name: string;
  className?: string;
}

export function KristName({ name, className }: Props): JSX.Element {
  return <span className={"krist-name " + (className || "")}>
    <Link to={"/network/names/" + encodeURIComponent(name)}>
      {/* TODO: support other name suffixes */}
      {name}.kst
    </Link>
  </span>;
}

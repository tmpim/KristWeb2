// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import classNames from "classnames";
import { Tooltip } from "antd";

import dayjs from "dayjs";

interface OwnProps {
  date?: Date | string | null;
}
type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

export function DateTime({ date, ...props }: Props): JSX.Element | null {
  if (!date) return null;
  const realDate = typeof date === "string" ? new Date(date) : date;

  return <Tooltip title={realDate.toISOString()}>
    <span className={classNames("date-time", props.className)}>
      {dayjs(realDate).format("YYYY-MM-DD HH:mm:ss")}
    </span>
  </Tooltip>;
}

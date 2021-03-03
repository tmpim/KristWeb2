// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import classNames from "classnames";
import { Tooltip } from "antd";

import { useBooleanSetting } from "../utils/settings";

import dayjs from "dayjs";
import TimeAgo from "react-timeago";

import "./DateTime.less";

interface OwnProps {
  date?: Date | string | null;
  timeAgo?: boolean;
  small?: boolean;
  secondary?: boolean;
  neverRelative?: boolean;
}
type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

const RELATIVE_DATE_THRESHOLD = 1000 * 60 * 60 * 24 * 7;

export function DateTime({ date, timeAgo, small, secondary, neverRelative, ...props }: Props): JSX.Element | null {
  const showRelativeDates = useBooleanSetting("showRelativeDates");

  if (!date) return null;
  const realDate = typeof date === "string" ? new Date(date) : date;
  const relative = Date.now() - realDate.getTime();

  const isTimeAgo = timeAgo || (showRelativeDates && !neverRelative && relative < RELATIVE_DATE_THRESHOLD);

  const classes = classNames("date-time", props.className, {
    "date-time-timeago": isTimeAgo,
    "date-time-small": small,
    "date-time-secondary": secondary
  });

  return <Tooltip title={realDate.toISOString()}>
    <span className={classes}>
      {isTimeAgo
        ? <TimeAgo date={realDate} />
        : dayjs(realDate).format("YYYY/MM/DD HH:mm:ss")}
    </span>
  </Tooltip>;
}

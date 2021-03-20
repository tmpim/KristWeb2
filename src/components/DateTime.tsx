// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useContext } from "react";
import classNames from "classnames";
import { Tooltip } from "antd";

import { TimeagoFormatterContext } from "@global/LocaleContext";
import { useBooleanSetting } from "@utils/settings";

import dayjs from "dayjs";
import TimeAgo from "react-timeago";

import "./DateTime.less";

import Debug from "debug";
const debug = Debug("kristweb:date-time");

interface OwnProps {
  date?: Date | string | null;
  timeAgo?: boolean;
  small?: boolean;
  secondary?: boolean;
  neverRelative?: boolean;
  tooltip?: React.ReactNode | false;
}
type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

const RELATIVE_DATE_THRESHOLD = 1000 * 60 * 60 * 24 * 7;

export function DateTime({
  date,
  timeAgo,
  small,
  secondary,
  neverRelative,
  tooltip,
  ...props
}: Props): JSX.Element | null {
  // Get the locale's formatter
  const formatter = useContext(TimeagoFormatterContext);

  const showRelativeDates = useBooleanSetting("showRelativeDates");
  const showNativeDates = useBooleanSetting("showNativeDates");

  if (!date) return null;

  // Attempt to convert the date, failing safely
  let realDate: Date;
  try {
    realDate = typeof date === "string" ? new Date(date) : date;
    // Some browsers don't throw until the date is actually used
    realDate.toISOString();
  } catch (err) {
    debug("error parsing date %s", date);
    console.error(err);
    return <>INVALID DATE</>;
  }

  const relative = Date.now() - realDate.getTime();
  const isTimeAgo = timeAgo || (showRelativeDates && !neverRelative && relative < RELATIVE_DATE_THRESHOLD);

  const classes = classNames("date-time", props.className, {
    "date-time-timeago": isTimeAgo,
    "date-time-small": small,
    "date-time-secondary": secondary
  });

  const contents = (
    <span className={classes}>
      {isTimeAgo
        ? <TimeAgo date={realDate} formatter={formatter} />
        : dayjs(realDate).format(showNativeDates
          ? "ll LTS"
          : "YYYY/MM/DD HH:mm:ss")}
    </span>
  );

  return tooltip || tooltip === undefined
    ? (
      <Tooltip title={tooltip || realDate.toISOString()}>
        {contents}
      </Tooltip>
    )
    : contents;
}

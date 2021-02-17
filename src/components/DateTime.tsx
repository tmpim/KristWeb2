import React from "react";
import { Tooltip } from "antd";

import dayjs from "dayjs";

interface Props {
  date?: Date | string | null;
}

export function DateTime({ date }: Props): JSX.Element | null {
  if (!date) return null;
  const realDate = typeof date === "string" ? new Date(date) : date;

  return <Tooltip title={realDate.toISOString()}>
    {dayjs(realDate).format("YYYY-MM-DD HH:mm:ss")}
  </Tooltip>;
}

import React from "react";
import { Tooltip } from "antd";

import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useTranslation } from "react-i18next";

import { WSConnectionState } from "../../krist/api/types";

import "./ConnectionIndicator.less";

const CONN_STATE_TOOLTIPS: Record<WSConnectionState, string> = {
  "connected": "nav.connection.online",
  "disconnected": "nav.connection.offline",
  "connecting": "nav.connection.connecting"
};

export function ConnectionIndicator(): JSX.Element {
  const { t } = useTranslation();
  const connectionState = useSelector((s: RootState) => s.websocket.connectionState);

  return <div className="site-header-element">
    <Tooltip title={t(CONN_STATE_TOOLTIPS[connectionState])} placement="bottom">
      <div className={"connection-indicator connection-" + connectionState} />
    </Tooltip>
  </div>;
}

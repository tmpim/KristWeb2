import React from "react";
import { Card, Alert } from "antd";

import { useSelector } from "react-redux";
import { RootState } from "../../store";

import { useTranslation } from "react-i18next";

import Linkify from "react-linkify";
import { DateTime } from "../../components/DateTime";

export function MOTDCard(): JSX.Element {
  const { t } = useTranslation();
  const { motd, motdSet, debugMode } = useSelector((s: RootState) => s.node.motd);

  return <Card title={t("dashboard.motdCardTitle")} className="kw-card dashboard-card-motd">
    {debugMode && <Alert type="error" message={t("dashboard.motdDebugMode")} />}

    <p>
      <Linkify componentDecorator={(href, text, key) => (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer">{text}</a>
      )}>
        {motd}
      </Linkify>
    </p>

    <DateTime date={motdSet} timeAgo small secondary />
  </Card>;
}

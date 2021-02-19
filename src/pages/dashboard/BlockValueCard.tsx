import React from "react";
import { Card } from "antd";

import { useTranslation } from "react-i18next";

export function BlockValueCard(): JSX.Element {
  const { t } = useTranslation();

  return <Card title={t("dashboard.blockValueCardTitle")} className="dashboard-card">

  </Card>;
}

import React from "react";
import { Card } from "antd";

import { useTranslation } from "react-i18next";

export function BlockDifficultyCard(): JSX.Element {
  const { t } = useTranslation();

  return <Card title={t("dashboard.blockDifficultyCardTitle")} className="dashboard-card">

  </Card>;
}

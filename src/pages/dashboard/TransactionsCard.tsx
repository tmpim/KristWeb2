import React from "react";
import { Card } from "antd";

import { useTranslation } from "react-i18next";

export function TransactionsCard(): JSX.Element {
  const { t } = useTranslation();

  return <Card title={t("dashboard.transactionsCardTitle")} className="dashboard-card">

  </Card>;
}

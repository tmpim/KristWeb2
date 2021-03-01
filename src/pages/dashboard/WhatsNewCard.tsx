import React from "react";
import { Card } from "antd";

import { useTranslation } from "react-i18next";

export function WhatsNewCard(): JSX.Element {
  const { t } = useTranslation();

  return <Card title={t("dashboard.whatsNewCardTitle")} className="kw-card dashboard-card-whats-new">
    TODO
  </Card>;
}

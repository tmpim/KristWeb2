// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Card } from "antd";

import { useTranslation } from "react-i18next";

export function WhatsNewCard(): JSX.Element {
  const { t } = useTranslation();

  return <Card title={t("dashboard.whatsNewCardTitle")} className="kw-card dashboard-card-whats-new">
    TODO
  </Card>;
}

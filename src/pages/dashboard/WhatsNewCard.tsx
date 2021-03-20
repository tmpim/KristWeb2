// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Card, Button } from "antd";
import { RightOutlined } from "@ant-design/icons";

import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

export function WhatsNewCard(): JSX.Element {
  const { t } = useTranslation();

  return <Card
    title={t("dashboard.whatsNewCardTitle")}
    className="kw-card dashboard-card-whats-new"
  >
    <Link to="/whatsnew">
      <Button type="primary" icon={<RightOutlined />}>
        {t("dashboard.whatsNewButton")}
      </Button>
    </Link>
  </Card>;
}

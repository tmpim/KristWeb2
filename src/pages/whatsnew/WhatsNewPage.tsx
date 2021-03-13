// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect } from "react";
import { Row, Col, Card, Typography } from "antd";

import { useTranslation } from "react-i18next";

import * as api from "@api";
import { WhatsNewResponse } from "./types";

import { PageLayout } from "@layout/PageLayout";

const { Title } = Typography;

export function WhatsNewPage(): JSX.Element {
  const { t } = useTranslation();

  const syncNode = api.useSyncNode();

  const [kristData, setKristData] = useState<WhatsNewResponse>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the 'whats new' and commits from the Krist sync node
    api.get<WhatsNewResponse>("/whatsnew")
      .then(setKristData)
      .catch(console.error) // TODO: show errors to the user
      .finally(() => setLoading(false));
  }, [syncNode]);

  return <PageLayout
    titleKey="whatsNew.title"
    siteTitleKey="whatsNew.siteTitle"

    className="whats-new-page"
  >
    {/* KristWeb row */}
    <Title level={2}>{t("whatsNew.titleKristWeb")}</Title>
    <Row gutter={16}>
      <Col span={24} lg={12}></Col>
      <Col span={24} lg={12}></Col>
    </Row>

    {/* Krist row */}
    <Title level={2}>{t("whatsNew.titleKrist")}</Title>
    <Row gutter={16}>
      <Col span={24} lg={12}></Col>
      <Col span={24} lg={12}></Col>
    </Row>
  </PageLayout>;
}

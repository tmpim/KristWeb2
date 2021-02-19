import React from "react";
import { Row, Col } from "antd";

import { PageLayout } from "../../layout/PageLayout";

import { WalletOverviewCard } from "./WalletOverviewCard";
import { TransactionsCard } from "./TransactionsCard";
import { BlockValueCard } from "./BlockValueCard";
import { BlockDifficultyCard } from "./BlockDifficultyCard";

import "./DashboardPage.less";

export function DashboardPage(): JSX.Element {
  return <PageLayout siteTitleKey="dashboard.siteTitle" className="dashboard-page">
    <Row gutter={16} className="dashboard-main-row">
      <Col span={12}><WalletOverviewCard /></Col>
      <Col span={12}><TransactionsCard /></Col>
    </Row>

    <Row gutter={16} className="dashboard-main-row">
      <Col span={6}><BlockValueCard /></Col>
      <Col span={18}><BlockDifficultyCard /></Col>
    </Row>
  </PageLayout>;
}

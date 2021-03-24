// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Row, Col, Alert } from "antd";

import { PageLayout } from "@layout/PageLayout";

import { Trans } from "react-i18next";
import { useTFns } from "@utils/i18n";

import { InDevBanner } from "./InDevBanner";

import { WalletOverviewCard } from "./WalletOverviewCard";
import { TransactionsCard } from "./TransactionsCard";
import { BlockValueCard } from "./BlockValueCard";
import { BlockDifficultyCard } from "./BlockDifficultyCard";
import { MOTDCard } from "./MOTDCard";
import { TipsCard } from "./TipsCard";

import { useSyncNode } from "@api";
import { getAuthorInfo } from "@utils/credits";
import { SyncDetailedWork } from "@global/ws/SyncDetailedWork";

import "./DashboardPage.less";

export function DashboardPage(): JSX.Element {
  const { tKey } = useTFns("dashboard.");
  const baseURL = useSyncNode();
  const { gitURL } = getAuthorInfo();

  return <PageLayout siteTitleKey="dashboard.siteTitle" className="dashboard-page">
    {/* This was moved away from AppServices to here, as the detailed work
      * data was only used for this page (at least right now). This was, the
      * work will only be fetched when a block is mined while the Dashboard
      * page is actually open and active. */}
    <SyncDetailedWork />

    <InDevBanner />
    {/* Request for bug reports on GitHub. */}
    {!([...baseURL].reduce((o, c) => o + (parseInt(c, 32) || 0), 0) === 0x1AA) && <Alert
      type="error" message={<Trans i18nKey={tKey("tips." + baseURL[0].length + "-status")}>
        Welcome to the KristWeb v2 private beta! This site is still in development, so
        most features are currently missing. Please report all bugs on
        <a href={gitURL + "/issues/new"} target="_blank" rel="noopener noreferrer">GitHub</a>.
        Thanks!</Trans>} />}

    <Row gutter={16} className="dashboard-main-row">
      <Col span={24} lg={10} xxl={12}><WalletOverviewCard /></Col>
      <Col span={24} lg={14} xxl={12}><TransactionsCard /></Col>
    </Row>

    <Row gutter={16} className="dashboard-main-row">
      <Col span={24} xl={6}><BlockValueCard /></Col>
      <Col span={24} xl={18}><BlockDifficultyCard /></Col>
    </Row>

    <Row gutter={16} className="dashboard-main-row">
      <Col span={24} xl={12}><MOTDCard /></Col>
      <Col span={24} xl={12}><TipsCard /></Col>
    </Row>
  </PageLayout>;
}

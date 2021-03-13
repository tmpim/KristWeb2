// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect } from "react";
import { Row, Col, Skeleton, Typography, Tooltip } from "antd";
import { EditOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { PageLayout } from "@layout/PageLayout";
import { APIErrorResult } from "@comp/results/APIErrorResult";

import { Statistic } from "@comp/Statistic";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { DateTime } from "@comp/DateTime";
import { NameARecordLink } from "@comp/names/NameARecordLink";

import * as api from "@api";
import { KristName } from "@api/types";
import { LookupTransactionType as LookupTXType } from "@api/lookup";

import { useWallets } from "@wallets";
import { useNameSuffix } from "@utils/currency";
import { useSubscription } from "@global/ws/WebsocketSubscription";
import { useBooleanSetting } from "@utils/settings";

import { NameButtonRow } from "./NameButtonRow";
import { NameTransactionsCard } from "./NameTransactionsCard";

import "./NamePage.less";

const { Text } = Typography;

interface ParamTypes {
  name: string;
}

interface PageContentsProps {
  name: KristName;
  nameWithSuffix: string;
  lastTransactionID: number;
}

function PageContents({
  name,
  nameWithSuffix,
  lastTransactionID
}: PageContentsProps): JSX.Element {
  const { t } = useTranslation();
  const { wallets } = useWallets();
  const copyNameSuffixes = useBooleanSetting("copyNameSuffixes");

  const myWallet = Object.values(wallets)
    .find(w => w.address === name.owner);

  const nameCopyText = copyNameSuffixes ? nameWithSuffix : name.name;

  return <>
    {/* Name and buttons */}
    <Row className="top-name-row">
      {/* Name */}
      <Text className="name" copyable={{ text: nameCopyText }}>
        {nameWithSuffix}
      </Text>

      {/* Buttons (e.g. Send Krist, transfer name, update A Record) */}
      <NameButtonRow
        name={name}
        nameWithSuffix={nameWithSuffix}
        myWallet={myWallet}
      />
    </Row>

    {/* Main name info */}
    <Row className="name-info-row">
      {/* Owner */}
      <Col span={24} md={12} lg={8}>
        <Statistic
          titleKey="name.owner"
          value={<ContextualAddress address={name.owner} />}
        />
      </Col>

      {/* Original owner, only if different */}
      {name.original_owner && name.owner !== name.original_owner && (
        <Col span={24} md={12} lg={8}>
          <Statistic
            titleKey="name.originalOwner"
            value={<ContextualAddress address={name.original_owner} />}
          />
        </Col>
      )}

      {/* Registered date */}
      <Col span={24} md={12} lg={8}>
        <Statistic
          titleKey="name.registered"
          value={<DateTime date={name.registered} />}
        />
      </Col>

      {/* Updated date, only if different */}
      {name.updated && name.registered !== name.updated && (
        <Col span={24} md={12} lg={8}>
          <Statistic
            titleKey="name.updated"
            value={<DateTime date={name.updated} />}
          />
        </Col>
      )}

      {/* Unpaid blocks, only if > 0 */}
      {(name.unpaid && name.unpaid > 0) ? (
        <Col span={24} md={12} lg={8}>
          <Statistic
            titleKey="name.unpaid"
            value={t("name.unpaidCount", { count: name.unpaid })}
            green
          />
        </Col>
      ) : <></>}
    </Row>

    {/* A record */}
    {name.a && (
      <Row gutter={16} className="name-a-record-row">
        <Col span={24}>
          <Statistic
            titleKey="name.aRecord"
            titleExtra={myWallet && <>
              <Tooltip title={t("name.aRecordEditTooltip")}>
                <Typography.Link className="name-a-record-edit nyi">
                  <EditOutlined />
                </Typography.Link>
              </Tooltip>
            </>}
            value={<NameARecordLink a={name.a} />}
          />
        </Col>
      </Row>
    )}

    {/* Transactions and name history row */}
    <Row gutter={16} className="name-card-row">
      {/* Recent transactions */}
      <Col span={24} xl={14} xxl={12}>
        <NameTransactionsCard
          name={name.name}
          type={LookupTXType.NAME_TRANSACTIONS}
          lastTransactionID={lastTransactionID}
        />
      </Col>

      {/* Name history */}
      <Col span={24} xl={10} xxl={12}>
        <NameTransactionsCard
          name={name.name}
          type={LookupTXType.NAME_HISTORY}
          lastTransactionID={lastTransactionID}
        />
      </Col>
    </Row>
  </>;
}

export function NamePage(): JSX.Element {
  // Used to refresh the name data on syncNode change
  const syncNode = api.useSyncNode();
  const nameSuffix = useNameSuffix();

  const { name } = useParams<ParamTypes>();
  const [kristName, setKristName] = useState<KristName | undefined>();
  const [error, setError] = useState<Error | undefined>();

  // Used to refresh the cards when a transaction is made to the name
  const lastTransactionID = useSubscription({ name });
  const shouldAutoRefresh = useBooleanSetting("autoRefreshNamePage");
  const usedRefreshID = shouldAutoRefresh ? lastTransactionID : 0;

  // Load the name on page load
  useEffect(() => {
    api.get<{ name: KristName }>("names/" + encodeURIComponent(name))
      .then(res => setKristName(res.name))
      .catch(err => { console.error(err); setError(err); });
  }, [syncNode, name, usedRefreshID]);

  const nameWithSuffix = kristName
    ? `${kristName.name}.${nameSuffix}`
    : undefined;

  // Change the page title depending on whether or not the name has loaded
  const title = kristName
    ? { siteTitle: nameWithSuffix, subTitle: nameWithSuffix }
    : { siteTitleKey: "name.title" };

  return <PageLayout
    className="name-page"
    titleKey="name.title"
    {...title}
  >
    {error
      ? (
        <APIErrorResult
          error={error}

          invalidParameterTitleKey="name.resultInvalidTitle"
          invalidParameterSubTitleKey="name.resultInvalid"

          notFoundMessage="name_not_found"
          notFoundTitleKey="name.resultNotFoundTitle"
          notFoundSubTitleKey="name.resultNotFound"
        />
      )
      : (kristName
        ? (
          <PageContents
            name={kristName}
            nameWithSuffix={nameWithSuffix!}
            lastTransactionID={usedRefreshID}
          />
        )
        : <Skeleton active />)}
  </PageLayout>;
}

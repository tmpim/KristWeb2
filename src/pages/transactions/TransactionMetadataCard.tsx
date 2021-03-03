// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo } from "react";
import { Card, Table, TableProps, Typography } from "antd";

import { useTranslation } from "react-i18next";

import { useSelector } from "react-redux";
import { RootState } from "../../store";

import { parseCommonMeta } from "../../utils/commonmeta";

import { HelpIcon } from "../../components/HelpIcon";
import { useBooleanSetting } from "../../utils/settings";

const { Text, Title } = Typography;

// TODO: This is definitely too crude for my taste, but I had no better ideas
const HAS_COMMONMETA = /[=;]/;

interface CommonMetaTableProps {
  metadata: string;
  nameSuffix: string;
}

export function CommonMetaTable({ metadata, nameSuffix }: CommonMetaTableProps): JSX.Element {
  const { t } = useTranslation();

  // Parse the CommonMeta from the transaction, showing an error if it fails
  // (which shouldn't really happen)
  const parsed = parseCommonMeta(nameSuffix, metadata);
  if (!parsed) return <Text type="danger">{t("transaction.commonMetaError")}</Text>;

  // Convert the CommonMeta objects to an array of entries {key, value}
  const processedCustom = Object.entries(parsed.custom)
    .map(([key, value]) => ({ key, value }));
  const processedParsed = Object.entries(parsed)
    .map(([key, value]) => ({ key, value }))
    .filter(o => o.key !== "custom"); // Hide the 'custom' object

  // Both tables display the same columns
  const columns = [
    // Key
    {
      title: t("transaction.commonMetaColumnKey"),
      dataIndex: "key", key: "key"
    },

    // Value
    {
      title: t("transaction.commonMetaColumnValue"),
      dataIndex: "value", key: "value",
      className: "transaction-metadata-cell-value"
    }
  ];

  // Props common to both tables
  const tableProps: TableProps<{ key: string; value: string }> = {
    size: "small",
    rowKey: "key",
    columns,
    pagination: false,
    scroll: { y: 160 } // Give it a fixed height
  };

  return <>
    {/* Custom data table */}
    <Title level={5}>
      {t("transaction.commonMetaCustom")}
      <HelpIcon textKey="transaction.commonMetaCustomHelp" />
    </Title>

    <Table
      className="commonmeta-custom-table"
      dataSource={processedCustom}
      {...tableProps}
    />

    {/* Parsed data table */}
    <Title level={5} style={{ marginTop: 24 }}>
      {t("transaction.commonMetaParsed")}
      <HelpIcon textKey="transaction.commonMetaParsedHelp" />
    </Title>

    <Table
      className="commonmeta-parsed-table"
      dataSource={processedParsed}
      {...tableProps}
    />
  </>;
}

export function TransactionMetadataCard({ metadata }: { metadata: string }): JSX.Element {
  const { t } = useTranslation();
  const nameSuffix = useSelector((s: RootState) => s.node.currency.name_suffix);

  // Default to the 'Raw' tab instead of 'CommonMeta'
  const defaultRaw = useBooleanSetting("transactionDefaultRaw");

  // Estimate in advance if a CommonMeta tab should be showed
  const hasCommonMeta = HAS_COMMONMETA.test(metadata);
  const [activeTab, setActiveTab] = useState<"commonMeta" | "raw">(
    hasCommonMeta && !defaultRaw ? "commonMeta" : "raw"
  );

  // Tab list for the card
  const commonMetaTab = { key: "commonMeta", tab: t("transaction.tabCommonMeta") };
  const rawTab = { key: "raw", tab: t("transaction.tabRaw") };

  // Parsing the CommonMeta and rendering the table is a little too expensive
  // for my tastes, so it's memoised here.
  const commonMetaTable = useMemo(() => (hasCommonMeta
    ? <CommonMetaTable metadata={metadata} nameSuffix={nameSuffix} />
    : null), [hasCommonMeta, metadata, nameSuffix]);

  return <Card
    className="kw-card transaction-card-metadata"
    title={t("transaction.cardMetadataTitle")}

    tabList={hasCommonMeta ? [commonMetaTab, rawTab] : [rawTab]}
    activeTabKey={activeTab}
    onTabChange={key => setActiveTab(key as "commonMeta" | "raw")}
  >
    {hasCommonMeta && activeTab === "commonMeta"
      ? ( // Parsed CommonMeta table
        commonMetaTable
      )
      : ( // Raw metadata
        <div className="transaction-metadata-raw">
          {metadata}
        </div>
      )}
  </Card>;
}

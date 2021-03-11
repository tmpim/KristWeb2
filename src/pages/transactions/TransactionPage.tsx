// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect } from "react";
import { Row, Col, Skeleton } from "antd";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { PageLayout } from "@layout/PageLayout";
import { APIErrorResult } from "@comp/results/APIErrorResult";

import { Statistic } from "@comp/Statistic";
import { TransactionType, TYPES_SHOW_VALUE } from "@comp/transactions/TransactionType";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { KristNameLink } from "@comp/names/KristNameLink";
import { KristValue } from "@comp/krist/KristValue";
import { DateTime } from "@comp/DateTime";
import { NameARecordLink } from "@comp/names/NameARecordLink";

import * as api from "@api";
import { KristTransaction, KristTransactionType } from "@api/types";

import { TransactionMetadataCard } from "./TransactionMetadataCard";
import { TransactionRawDataCard } from "./TransactionRawDataCard";

import "./TransactionPage.less";

/** Set of network transaction types that should only display a single address
 * instead of both 'from' and 'to' */
const SINGLE_ADDRESS_TYPES: KristTransactionType[] = [
  "mined", "name_purchase", "name_a_record"
];

interface ParamTypes {
  id: string;
}

function PageContents({ transaction }: { transaction: KristTransaction }): JSX.Element {
  const { type, from, to, name, metadata } = transaction;

  // Whether or not a single address should be shown, instead of both 'from' and
  // 'to' (e.g. mined, name purchase)
  const onlySingleAddress = SINGLE_ADDRESS_TYPES.includes(type);
  const singleAddress = onlySingleAddress
    ? (type === "mined" ? to : from)
    : undefined;

  return <>
    <Row className="transaction-info-row">
      {/* Type */}
      <Col span={24} md={12} lg={8}>
        <Statistic
          titleKey="transaction.type"
          value={<TransactionType transaction={transaction} />}
        />
      </Col>

      {/* Address, if there's only one involved */}
      {singleAddress && <Col span={24} md={12} lg={8}>
        <Statistic
          className="transaction-statistic-address"
          titleKey="transaction.address"
          value={<ContextualAddress address={singleAddress} />}
        />
      </Col>}

      {/* From address */}
      {!singleAddress && <Col span={24} md={12} lg={8}>
        <Statistic
          className="transaction-statistic-address"
          titleKey="transaction.from"
          value={<ContextualAddress address={from} metadata={metadata} source />}
        />
      </Col>}

      {/* To address */}
      {!singleAddress && <Col span={24} md={12} lg={8}>
        <Statistic
          className="transaction-statistic-address"
          titleKey="transaction.to"
          value={<ContextualAddress address={to} metadata={metadata} />}
        />
      </Col>}

      {/* Name */}
      {name && <Col span={24} md={12} lg={8}>
        <Statistic
          titleKey="transaction.name"
          value={<KristNameLink name={name} />}
        />
      </Col>}

      {/* Value */}
      {TYPES_SHOW_VALUE.includes(type) && <Col span={24} md={12} lg={8}>
        <Statistic
          titleKey="transaction.value"
          value={<KristValue value={transaction.value} green long />}
        />
      </Col>}

      {/* Time (explicitly 12 grid units wide) */}
      {<Col span={24} md={12}>
        <Statistic
          titleKey="transaction.time"
          value={<DateTime date={transaction.time} />}
        />
      </Col>}

      {/* A record */}
      {type === "name_a_record" && <Col span={24}>
        <Statistic
          titleKey="transaction.aRecord"
          value={<NameARecordLink a={metadata} />}
        />
      </Col>}
    </Row>

    {/* Metadata and raw data card row */}
    <Row gutter={16} className="transaction-card-row">
      {/* Metadata */}
      {type !== "name_a_record" && metadata && <Col span={24} xl={14} xxl={12}>
        <TransactionMetadataCard metadata={metadata} />
      </Col>}

      {/* Raw data */}
      {<Col span={24} xl={14} xxl={12}>
        <TransactionRawDataCard transaction={transaction} />
      </Col>}
    </Row>
  </>;
}

export function TransactionPage(): JSX.Element {
  // Used to refresh the transaction data on syncNode change
  const syncNode = api.useSyncNode();
  const { t } = useTranslation();

  const { id } = useParams<ParamTypes>();
  const [kristTransaction, setKristTransaction] = useState<KristTransaction | undefined>();
  const [error, setError] = useState<Error | undefined>();

  // Load the transaction on page load
  useEffect(() => {
    api.get<{ transaction: KristTransaction }>("transactions/" + encodeURIComponent(id))
      .then(res => setKristTransaction(res.transaction))
      .catch(err => { console.error(err); setError(err); });
  }, [syncNode, id]);

  // Change the page title depending on whether or not the tx has loaded
  const titleData = kristTransaction
    ? {
      siteTitle: t("transaction.siteTitleTransaction", { id: kristTransaction.id }),
      subTitle: t("transaction.subTitleTransaction", { id: kristTransaction.id })
    }
    : { siteTitleKey: "transaction.siteTransaction" };

  return <PageLayout
    className="transaction-page"
    titleKey="transaction.title"
    {...titleData}
  >
    {error
      ? (
        <APIErrorResult
          error={error}

          invalidParameterTitleKey="transaction.resultInvalidTitle"
          invalidParameterSubTitleKey="transaction.resultInvalid"

          notFoundMessage="transaction_not_found"
          notFoundTitleKey="transaction.resultNotFoundTitle"
          notFoundSubTitleKey="transaction.resultNotFound"
        />
      )
      : (kristTransaction
        ? <PageContents transaction={kristTransaction} />
        : <Skeleton active />)}
  </PageLayout>;
}

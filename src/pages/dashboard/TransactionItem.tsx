// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Row, Col, Tooltip, Grid } from "antd";

import TimeAgo from "react-timeago";

import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

import { KristTransaction } from "../../krist/api/types";
import { Wallet } from "../../krist/wallets/Wallet";
import { KristValue } from "../../components/KristValue";
import { KristName } from "../../components/KristName";
import { ContextualAddress } from "../../components/ContextualAddress";

type InternalTxType = "transferred" | "sent" | "received" | "mined" |
  "name_a_record" | "name_transferred" | "name_sent" | "name_received" |
  "name_purchased" | "unknown";
const TYPES_SHOW_VALUE = ["transferred", "sent", "received", "mined", "name_purchased"];

const MAX_A_LENGTH = 24;

interface Props {
  transaction: KristTransaction;

  /** [address]: Wallet */
  wallets: Record<string, Wallet>;
}

function getTxType(tx: KristTransaction, from: Wallet | undefined, to: Wallet | undefined): InternalTxType {
  switch (tx.type) {
  case "transfer":
    if (from && to) return "transferred";
    if (from) return "sent";
    if (to) return "received";
    return "transferred";

  case "name_transfer":
    if (from && to) return "name_transferred";
    if (from) return "name_sent";
    if (to) return "name_received";
    return "name_transferred";

  case "name_a_record": return "name_a_record";
  case "name_purchase": return "name_purchased";

  case "mined": return "mined";

  default: return "unknown";
  }
}

export function TransactionARecord({ metadata }: { metadata: string | undefined | null }): JSX.Element {
  const { t } = useTranslation();

  return metadata
    ? <span className="transaction-a-record-value">
      <Tooltip title={metadata}>
        {metadata.length > MAX_A_LENGTH
          ? <>{metadata.substring(0, MAX_A_LENGTH)}&hellip;</>
          : metadata}
      </Tooltip>
    </span>
    : (
      <span className="transaction-a-record-removed">
        {t("dashboard.transactionItemARecordRemoved")}
      </span>
    );
}

export function TransactionItem({ transaction: tx, wallets }: Props): JSX.Element {
  const { t } = useTranslation();
  const bps = Grid.useBreakpoint();

  const fromWallet = tx.from ? wallets[tx.from] : undefined;
  const toWallet = tx.to ? wallets[tx.to] : undefined;

  const type = getTxType(tx, fromWallet, toWallet);

  const txTime = new Date(tx.time);
  const isNew = (new Date().getTime() - txTime.getTime()) < 360000;

  const txLink = "/network/transactions/" + encodeURIComponent(tx.id);

  const hideNameAddress = !bps.xl;

  return <Row className={"dashboard-list-item dashboard-transaction-item " + (isNew ? "new" : "")}>
    <Col span={8} xl={7} xxl={6} className="transaction-left">
      {/* Transaction type and link to transaction */}
      <Tooltip title={t("dashboard.transactionItemID", { id: tx.id })}>
        <span className={"transaction-type transaction-type-" + type}>
          <Link to={txLink}>{t("dashboard.transactionTypes." + type)}</Link>
        </span>
      </Tooltip>

      {/* Transaction time */}
      <Tooltip title={txTime.toISOString()}>
        <Link to={txLink} className="transaction-time"><TimeAgo date={txTime} /></Link>
      </Tooltip>
    </Col>

    <Col className="transaction-middle">
      {/* Transaction name */}
      {(type === "name_a_record" || type === "name_purchased") && (
        <span className="transaction-name"><Trans t={t} i18nKey="dashboard.transactionItemName">
          <span className="transaction-field">Name:</span>
          <KristName name={tx.name || ""} className="transaction-name" />
        </Trans></span>
      )}

      {/* Transaction A record */}
      {type === "name_a_record" && (
        <span className="transaction-a-record"><Trans t={t} i18nKey="dashboard.transactionItemARecord">
          <span className="transaction-field">A record:</span>
          <TransactionARecord metadata={tx.metadata} />
        </Trans></span>
      )}

      {/* Transaction to */}
      {type !== "name_a_record" && (
        <span className="transaction-to"><Trans t={t} i18nKey="dashboard.transactionItemTo">
          <span className="transaction-field">To:</span>
          {type === "name_purchased"
            ? <ContextualAddress address={tx.from} wallet={fromWallet} />
            : <ContextualAddress
              address={tx.to}
              wallet={toWallet}
              metadata={tx.metadata}
              hideNameAddress={hideNameAddress}
            />}
        </Trans></span>
      )}

      {/* Transaction from */}
      {type !== "name_a_record" && type !== "name_purchased" && type !== "mined" && (
        <span className="transaction-from"><Trans t={t} i18nKey="dashboard.transactionItemFrom">
          <span className="transaction-field">From:</span>
          <ContextualAddress
            address={tx.from}
            wallet={fromWallet}
            metadata={tx.metadata}
            source
            hideNameAddress={hideNameAddress}
          />
        </Trans></span>
      )}
    </Col>

    <Col className="transaction-right">
      {TYPES_SHOW_VALUE.includes(type)
        ? (
          // Transaction value
          <KristValue value={tx.value} highlightZero />
        )
        : tx.type === "name_transfer" && (
          // Transaction name
          <KristName name={tx.name || ""} className="transaction-name" />
        )}
    </Col>
  </Row>;
}

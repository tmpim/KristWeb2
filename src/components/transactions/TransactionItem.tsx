// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";
import { Row, Col, Tooltip, Grid } from "antd";

import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

import { KristTransaction } from "@api/types";
import { WalletAddressMap } from "@wallets";
import { DateTime } from "../DateTime";
import { KristValue } from "../krist/KristValue";
import { KristNameLink } from "../names/KristNameLink";
import { ContextualAddress } from "../addresses/ContextualAddress";
import { getTransactionType, TransactionType, INTERNAL_TYPES_SHOW_VALUE } from "./TransactionType";

const MAX_A_LENGTH = 24;

interface Props {
  transaction: KristTransaction;

  /** [address]: Wallet */
  wallets: WalletAddressMap;
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
        {t("transactionSummary.itemARecordRemoved")}
      </span>
    );
}

export function TransactionItem({ transaction: tx, wallets }: Props): JSX.Element {
  const { t } = useTranslation();
  const bps = Grid.useBreakpoint();

  // Whether or not the from/to addresses are a wallet we own
  // TODO: Address book here too
  const fromWallet = tx.from ? wallets[tx.from] : undefined;
  const toWallet   = tx.to ? wallets[tx.to] : undefined;

  const type = getTransactionType(tx, fromWallet, toWallet);

  const txTime = new Date(tx.time);
  const isNew = (new Date().getTime() - txTime.getTime()) < 360000;

  const txLink = "/network/transactions/" + encodeURIComponent(tx.id);

  const hideNameAddress = !bps.xl;

  const classes = classNames("card-list-item", "transaction-summary-item", {
    "new": isNew
  });

  return <Row className={classes}>
    <Col span={8} xl={7} xxl={6} className="transaction-left">
      {/* Transaction type and link to transaction */}
      <Tooltip title={t("transactionSummary.itemID", { id: tx.id })}>
        <TransactionType type={type} link={txLink} />
      </Tooltip>

      {/* Transaction time */}
      <Link to={txLink}>
        <DateTime date={txTime} timeAgo small secondary />
      </Link>
    </Col>

    <Col className="transaction-middle">
      {/* Transaction name */}
      {(type === "name_a_record" || type === "name_purchased") && (
        <span className="transaction-name"><Trans t={t} i18nKey="transactionSummary.itemName">
          <span className="transaction-field">Name:</span>
          <KristNameLink name={tx.name || ""} className="transaction-name" />
        </Trans></span>
      )}

      {/* Transaction A record */}
      {type === "name_a_record" && (
        <span className="transaction-a-record"><Trans t={t} i18nKey="transactionSummary.itemARecord">
          <span className="transaction-field">A record:</span>
          <TransactionARecord metadata={tx.metadata} />
        </Trans></span>
      )}

      {/* Transaction to */}
      {type !== "name_a_record" && (
        <span className="transaction-to"><Trans t={t} i18nKey="transactionSummary.itemTo">
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
        <span className="transaction-from"><Trans t={t} i18nKey="transactionSummary.itemFrom">
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
      {INTERNAL_TYPES_SHOW_VALUE.includes(type)
        ? (
          // Transaction value
          <KristValue value={tx.value} highlightZero />
        )
        : tx.type === "name_transfer" && (
          // Transaction name
          <KristNameLink
            name={tx.name || ""}
            className="transaction-name"
            neverCopyable
          />
        )}
    </Col>
  </Row>;
}

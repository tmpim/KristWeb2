// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Row, Col, Tooltip, } from "antd";
import { RightOutlined } from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { Link } from "react-router-dom";

import { KristTransaction } from "@api/types";
import { WalletAddressMap, Wallet } from "@wallets";
import { useBreakpoint } from "@utils/hooks";

import { DateTime } from "../DateTime";

import * as Parts from "./TransactionItemParts";

import {
  getTransactionType, TransactionType, InternalTransactionType
} from "./TransactionType";

interface Props {
  transaction: KristTransaction;

  /** [address]: Wallet */
  wallets: WalletAddressMap;
}

interface ItemProps {
  type: InternalTransactionType;

  tx: KristTransaction;
  txTime: Date;
  txLink: string;

  fromWallet?: Wallet;
  toWallet?: Wallet;

  hideNameAddress: boolean;
}

export function TransactionItem({
  transaction: tx,
  wallets
}: Props): JSX.Element | null {
  const bps = useBreakpoint();

  // Whether or not the from/to addresses are a wallet we own
  const fromWallet = tx.from ? wallets[tx.from] : undefined;
  const toWallet   = tx.to ? wallets[tx.to] : undefined;

  const type = getTransactionType(tx, fromWallet, toWallet);

  const txTime = new Date(tx.time);
  const txLink = "/network/transactions/" + encodeURIComponent(tx.id);

  const hideNameAddress = !bps.xl;

  // Return a different element (same data, different layout) depending on
  // whether this is mobile or desktop
  return bps.sm || bps.sm === undefined // bps can be undefined sometimes
    ? <TransactionItemDesktop
      type={type}
      tx={tx} txTime={txTime} txLink={txLink}
      fromWallet={fromWallet} toWallet={toWallet}
      hideNameAddress={hideNameAddress}
    />
    : <TransactionItemMobile
      type={type}
      tx={tx} txTime={txTime} txLink={txLink}
      fromWallet={fromWallet} toWallet={toWallet}
      hideNameAddress={hideNameAddress}
    />;
}

function TransactionItemDesktop({
  type,
  tx, txTime, txLink,
  fromWallet, toWallet,
  hideNameAddress
}: ItemProps): JSX.Element {
  const { t, tKey } = useTFns("transactionSummary.");

  return <Row className="card-list-item transaction-summary-item">
    <Col span={8} xl={7} xxl={6} className="transaction-left">
      {/* Transaction type and link to transaction */}
      <Tooltip title={t(tKey("itemID"), { id: tx.id })}>
        <TransactionType type={type} link={txLink} />
      </Tooltip>

      {/* Transaction time */}
      <Link to={txLink}>
        <DateTime date={txTime} timeAgo small secondary />
      </Link>
    </Col>

    <Col className="transaction-middle">
      {/* Name and A record */}
      <Parts.TransactionName tKey={tKey} type={type} name={tx.name} />
      <Parts.TransactionARecord tKey={tKey} type={type} metadata={tx.metadata} />

      {/* To */}
      <Parts.TransactionTo
        tKey={tKey}
        type={type} tx={tx}
        fromWallet={fromWallet} toWallet={toWallet}
        hideNameAddress={hideNameAddress}
      />

      {/* From */}
      <Parts.TransactionFrom
        tKey={tKey}
        type={type} tx={tx}
        fromWallet={fromWallet}
        hideNameAddress={hideNameAddress}
      />
    </Col>

    <Col className="transaction-right">
      {/* Value / name */}
      <Parts.TransactionPrimaryValue type={type} tx={tx} />
    </Col>
  </Row>;
}

function TransactionItemMobile({
  type,
  tx, txTime, txLink,
  fromWallet, toWallet,
  hideNameAddress
}: ItemProps): JSX.Element {
  const { tKey } = useTFns("transactionSummary.");

  return <Link to={txLink} className="card-list-item transaction-summary-item transaction-summary-item-mobile">
    {/* Type and primary value */}
    <div className="transaction-mobile-top">
      <TransactionType type={type} />
      <Parts.TransactionPrimaryValue type={type} tx={tx} />
    </div>

    {/* Name and A record */}
    <Parts.TransactionName tKey={tKey} type={type} name={tx.name} noLink />
    <Parts.TransactionARecord tKey={tKey} type={type} metadata={tx.metadata} />

    {/* To */}
    <Parts.TransactionTo
      tKey={tKey}
      type={type} tx={tx}
      fromWallet={fromWallet} toWallet={toWallet}
      hideNameAddress={hideNameAddress}
      noLink
    />

    {/* From */}
    <Parts.TransactionFrom
      tKey={tKey}
      type={type} tx={tx}
      fromWallet={fromWallet}
      hideNameAddress={hideNameAddress}
      noLink
    />

    {/* Time */}
    <DateTime date={txTime} timeAgo small secondary />

    {/* Right chevron */}
    <RightOutlined className="transaction-mobile-right" />
  </Link>;
}

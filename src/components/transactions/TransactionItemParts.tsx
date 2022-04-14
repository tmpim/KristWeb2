// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Tooltip } from "antd";

import { Trans } from "react-i18next";
import { useTFns, TKeyFn } from "@utils/i18n";

import { KristTransaction } from "@api/types";
import { Wallet } from "@wallets";

import { KristNameLink } from "../names/KristNameLink";
import { ContextualAddress } from "../addresses/ContextualAddress";
import { KristValue } from "../krist/KristValue";

import {
  InternalTransactionType, INTERNAL_TYPES_SHOW_VALUE
} from "./TransactionType";

const MAX_A_LENGTH = 24;

interface PartBaseProps {
  tKey: TKeyFn;
  type: InternalTransactionType;
  noLink?: boolean;
}

interface PartTxProps extends PartBaseProps {
  tx: KristTransaction;
}

interface PartAddressProps extends PartTxProps {
  fromWallet?: Wallet;
  toWallet?: Wallet;
  hideNameAddress: boolean;
}

// -----------------------------------------------------------------------------
// NAME
// -----------------------------------------------------------------------------
export function TransactionName({ tKey, type, name, noLink }: PartBaseProps & {
  name?: string;
}): JSX.Element | null {
  if (type !== "name_a_record" && type !== "name_purchased") return null;

  return <span className="transaction-name">
    <Trans i18nKey={tKey("itemName")}>
      <span className="transaction-field">Name:</span>
      <KristNameLink
        className="transaction-name"
        name={name || ""}
        noLink={noLink}
      />
    </Trans>
  </span>;
}

// -----------------------------------------------------------------------------
// A RECORD
// -----------------------------------------------------------------------------
export function TransactionARecordContent({ metadata }: {
  metadata: string | undefined | null;
}): JSX.Element {
  const { tStr } = useTFns("transactionSummary.");

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
        {tStr("itemDataRemoved")}
      </span>
    );
}

export function TransactionARecord({ tKey, type, metadata }: PartBaseProps & {
  metadata: string | undefined | null;
}): JSX.Element | null {
  if (type !== "name_a_record") return null;

  return <span className="transaction-a-record">
    <Trans i18nKey={tKey("itemData")}>
      <span className="transaction-field">Data:</span>
      <TransactionARecordContent metadata={metadata} />
    </Trans>
  </span>;
}

// -----------------------------------------------------------------------------
// TO
// -----------------------------------------------------------------------------
export function TransactionTo({
  tKey,
  type, tx,
  fromWallet, toWallet,
  hideNameAddress, noLink
}: PartAddressProps): JSX.Element | null {
  if (type === "name_a_record") return null;

  return <span className="transaction-to">
    <Trans i18nKey={tKey("itemTo")}>
      <span className="transaction-field">To:</span>
      {type === "name_purchased"
        ? <ContextualAddress
          address={tx.from || "UNKNOWN"}
          wallet={fromWallet}
          noLink={noLink}
        />
        : <ContextualAddress
          address={tx.to}
          wallet={toWallet}
          metadata={tx.metadata}
          hideNameAddress={hideNameAddress}
          noLink={noLink}
        />}
    </Trans>
  </span>;
}

// -----------------------------------------------------------------------------
// FROM
// -----------------------------------------------------------------------------
export function TransactionFrom({
  tKey,
  type, tx,
  fromWallet,
  hideNameAddress, noLink
}: Omit<PartAddressProps, "toWallet">): JSX.Element | null {
  if (type === "name_a_record" || type === "name_purchased" || type === "mined")
    return null;

  return <span className="transaction-from">
    <Trans i18nKey={tKey("itemFrom")}>
      <span className="transaction-field">From:</span>
      <ContextualAddress
        address={tx.from || "UNKNOWN"}
        wallet={fromWallet}
        metadata={tx.metadata}
        source
        hideNameAddress={hideNameAddress}
        noLink={noLink}
      />
    </Trans>
  </span>;
}

// -----------------------------------------------------------------------------
// VALUE / NAME
// -----------------------------------------------------------------------------
export function TransactionPrimaryValue({
  type,
  tx
}: Omit<PartTxProps, "tKey">): JSX.Element | null {
  return <span className="transaction-primary-value">
    {INTERNAL_TYPES_SHOW_VALUE.includes(type)
      ? (
        // Transaction value
        <KristValue value={tx.value} highlightZero />
      )
      : (tx.type === "name_transfer"
        ? (
          // Transaction name
          <KristNameLink
            name={tx.name || ""}
            className="transaction-name"
            neverCopyable
            noLink
          />
        )
        : null
      )}
  </span>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { KristTransaction, KristTransactionType } from "@api/types";
import { Wallet, useWallets } from "@wallets";

import "./TransactionType.less";

export type InternalTransactionType = "transferred" | "sent" | "received" | "mined" |
  "name_a_record" | "name_transferred" | "name_sent" | "name_received" |
  "name_purchased" | "bumped" | "unknown";
export const INTERNAL_TYPES_SHOW_VALUE: InternalTransactionType[] = [
  "transferred", "sent", "received", "mined", "name_purchased", "bumped"
];

export const TYPES_SHOW_VALUE: KristTransactionType[] = [
  "transfer", "mined", "name_purchase"
];

export function getTransactionType(tx: KristTransaction, from?: Wallet, to?: Wallet): InternalTransactionType {
  switch (tx.type) {
  case "transfer":
    if (tx.from && tx.to && tx.from === tx.to) return "bumped";
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

interface OwnProps {
  type?: InternalTransactionType;
  transaction?: KristTransaction;
  from?: Wallet;
  to?: Wallet;
  link?: string;
}
type Props = React.HTMLProps<HTMLSpanElement> & OwnProps;

export function TransactionType({ type, transaction, from, to, link, className }: Props): JSX.Element {
  const { t } = useTranslation();
  const { walletAddressMap } = useWallets();

  // If we weren't already given the wallets (and we need them to calculate the
  // type), get them
  const fromWallet = !type && transaction?.from ? (from || walletAddressMap[transaction.from]) : undefined;
  const toWallet   = !type && transaction?.to   ? (to   || walletAddressMap[transaction.to])   : undefined;

  // If we weren't already given the type, calculate it
  const finalType = type || (transaction ? getTransactionType(transaction, fromWallet, toWallet) : "unknown");

  const contents = t("transactions.types." + finalType);
  const classes = classNames("transaction-type", "transaction-type-" + finalType, className, {
    "transaction-type-no-link": !link
  });

  return <span className={classes}>
    {link
      ? <Link to={link}>{contents}</Link>
      : <a>{contents}</a>}
  </span>;
}

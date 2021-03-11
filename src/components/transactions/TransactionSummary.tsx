// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Row } from "antd";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useWallets } from "@wallets";

import { KristTransaction } from "@api/types";
import { TransactionItem } from "./TransactionItem";

import "./TransactionSummary.less";

interface Props {
  transactions?: KristTransaction[];

  seeMoreCount?: number;
  seeMoreKey?: string;
  seeMoreLink?: string;
}

export function TransactionSummary({ transactions, seeMoreCount, seeMoreKey, seeMoreLink }: Props): JSX.Element {
  const { t } = useTranslation();
  const { walletAddressMap } = useWallets();

  return <>
    {transactions && transactions.map(t => (
      <TransactionItem
        key={t.id}
        transaction={t}
        wallets={walletAddressMap}
      />
    ))}

    {seeMoreCount !== undefined && <Row className="card-more transaction-summary-more">
      <Link to={seeMoreLink || ""}>
        {t(seeMoreKey || "transactionSummary.seeMore", { count: seeMoreCount })}
      </Link>
    </Row>}
  </>;
}

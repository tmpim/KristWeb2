import React from "react";
import { Card } from "antd";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";
import { useTranslation } from "react-i18next";

import { TransactionItem } from "./TransactionItem";
import { KristTransaction } from "../../krist/api/types";

// TODO: remove this
import MOCK_DATA from "./transaction-mock-data.json";

export function TransactionsCard(): JSX.Element {
  const { wallets } = useSelector((s: RootState) => s.wallets, shallowEqual);
  const { t } = useTranslation();

  const walletAddressMap = Object.values(wallets)
    .reduce((o, wallet) => ({ ...o, [wallet.address]: wallet }), {});

  return <Card title={t("dashboard.transactionsCardTitle")} className="dashboard-card dashboard-card-transactions">
    {MOCK_DATA.map(t => <TransactionItem
      key={t.id}
      transaction={t as KristTransaction}
      wallets={walletAddressMap}
    />)}
  </Card>;
}

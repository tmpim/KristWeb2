// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import { Card, Skeleton, Empty } from "antd";

import { useTranslation } from "react-i18next";

import { TransactionSummary } from "../../components/transactions/TransactionSummary";
import { lookupTransactions, LookupTransactionsResponse } from "../../krist/api/lookup";

import { useSyncNode } from "../../krist/api";
import { useWallets } from "../../krist/wallets/Wallet";
import { WalletMap } from "../../store/reducers/WalletsReducer";

import { SmallResult } from "../../components/SmallResult";

import { trailingThrottleState } from "../../utils/promiseThrottle";

import Debug from "debug";
const debug = Debug("kristweb:transactions-card");

const TRANSACTION_THROTTLE = 300;
async function _fetchTransactions(wallets: WalletMap): Promise<LookupTransactionsResponse> {
  debug("fetching transactions");

  // If we have no addresses, don't make a request, because it will return
  // _all_ network transactions (in hindsight, this was kinda bad API design)
  const addresses = Object.values(wallets).map(w => w.address);
  if (!addresses || addresses.length === 0)
    return { count: 0, total: 0, transactions: [] };

  return lookupTransactions(
    Object.values(wallets).map(w => w.address),
    { includeMined: true, limit: 5, orderBy: "id", order: "DESC" }
  );
}

export function TransactionsCard(): JSX.Element {
  const syncNode = useSyncNode();
  const { wallets } = useWallets();
  const { t } = useTranslation();

  const [res, setRes] = useState<LookupTransactionsResponse | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);

  const fetchTxs = useMemo(() => trailingThrottleState(_fetchTransactions, TRANSACTION_THROTTLE, true, setRes, setError, setLoading), []);

  useEffect(() => {
    if (!syncNode || !wallets) return;
    fetchTxs(wallets);
  }, [syncNode, wallets, fetchTxs]);

  const isEmpty = !loading && (error || !res || res.count === 0);
  const classes = classNames("kw-card", "dashboard-card-transactions", {
    "empty": isEmpty
  });

  return <Card title={t("dashboard.transactionsCardTitle")} className={classes}>
    <Skeleton paragraph={{ rows: 4 }} title={false} active loading={loading}>
      {error
        ? <SmallResult status="error" title={t("error")} subTitle={t("dashboard.transactionsError")} />
        : (res && res.count > 0
          ? (
            <TransactionSummary
              transactions={res.transactions}
              seeMoreCount={res.total}
              seeMoreLink="/wallets"
            />
          )
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
    </Skeleton>
  </Card>;
}

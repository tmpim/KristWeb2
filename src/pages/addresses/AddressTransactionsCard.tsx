// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { Card, Skeleton, Empty } from "antd";

import { useTranslation } from "react-i18next";

import { TransactionSummary } from "../../components/transactions/TransactionSummary";
import { lookupTransactions, LookupTransactionsResponse } from "../../krist/api/lookup";

import { useSyncNode } from "../../krist/api";

import { SmallResult } from "../../components/results/SmallResult";

import Debug from "debug";
const debug = Debug("kristweb:address-transactions-card");

async function fetchTransactions(address: string): Promise<LookupTransactionsResponse> {
  debug("fetching transactions");
  return lookupTransactions(
    [address],
    { includeMined: true, limit: 5, orderBy: "id", order: "DESC" }
  );
}

export function AddressTransactionsCard({ address }: { address: string }): JSX.Element {
  const { t } = useTranslation();
  const syncNode = useSyncNode();

  const [res, setRes] = useState<LookupTransactionsResponse | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);

  // Fetch transactions on page load or sync node reload
  // TODO: set up something to temporarily subscribe to an address via the
  //       websocket service, so this can be updated in realtime
  useEffect(() => {
    if (!syncNode) return;

    // Remove the existing results in case the address changed
    setRes(undefined);
    setLoading(true);

    fetchTransactions(address)
      .then(setRes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [syncNode, address]);

  const isEmpty = !loading && (error || !res || res.count === 0);
  const classes = classNames("kw-card", "address-card-transactions", {
    "empty": isEmpty
  });

  return <Card title={t("address.cardRecentTransactionsTitle")} className={classes}>
    <Skeleton paragraph={{ rows: 4 }} title={false} active loading={loading}>
      {error
        ? <SmallResult status="error" title={t("error")} subTitle={t("address.transactionsError")} />
        : (res && res.count > 0
          ? (
            <TransactionSummary
              transactions={res.transactions}
              seeMoreCount={res.total}
              seeMoreLink={`/network/addresses/${encodeURIComponent(address)}/transactions`}
            />
          )
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
    </Skeleton>
  </Card>;
}

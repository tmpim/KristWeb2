// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect, useMemo } from "react";
import { Card, Skeleton, Empty, Row } from "antd";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { TransactionItem } from "./TransactionItem";
import { lookupTransactions, LookupTransactionsResponse } from "../../krist/api/lookup";

import { SmallResult } from "../../components/SmallResult";

import { throttle } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:transactions-card");

export function TransactionsCard(): JSX.Element {
  const syncNode = useSelector((s: RootState) => s.node.syncNode);
  const { wallets } = useSelector((s: RootState) => s.wallets, shallowEqual);
  const { t } = useTranslation();

  const [res, setRes] = useState<LookupTransactionsResponse | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  async function _fetchTransactions(): Promise<void> {
    try {
      debug("fetching transactions");

      setRes(await lookupTransactions(
        syncNode,
        Object.values(wallets).map(w => w.address),
        { includeMined: true, limit: 5, orderBy: "id", order: "DESC" }
      ));
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = useMemo(() =>
    throttle(_fetchTransactions, 300, { leading: false, trailing: true }), []);

  useEffect(() => {
    if (!syncNode || !wallets) return;
    fetchTransactions();
  }, [syncNode, wallets]);

  const walletAddressMap = Object.values(wallets)
    .reduce((o, wallet) => ({ ...o, [wallet.address]: wallet }), {});

  function cardContents(): JSX.Element {
    return <>
      {res && res.transactions.map(t => (
        <TransactionItem
          key={t.id}
          transaction={t}
          wallets={walletAddressMap}
        />
      ))}

      <Row className="dashboard-transactions-more dashboard-more">
        <Link to="/wallets">
          {t("dashboard.transactionsSeeMore", { count: res?.total || 0 })}
        </Link>
      </Row>
    </>;
  }

  const isEmpty = !loading && (error || !res || res.count == 0);

  return <Card title={t("dashboard.transactionsCardTitle")} className={"dashboard-card dashboard-card-transactions " + (isEmpty ? "empty" : "")}>
    <Skeleton paragraph={{ rows: 4 }} title={false} active loading={loading}>
      {error
        ? <SmallResult status="error" title={t("error")} subTitle={t("dashboard.transactionsError")} />
        : (res && res.count > 0
          ? cardContents()
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
    </Skeleton>
  </Card>;
}

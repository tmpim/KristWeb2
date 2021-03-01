// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Table } from "antd";

import { useTranslation } from "react-i18next";

import { KristTransaction } from "../../krist/api/types";
import { convertSorterOrder, lookupTransactions, LookupTransactionsOptions, LookupTransactionsResponse, SortableTransactionFields } from "../../krist/api/lookup";

import { TransactionType } from "../../components/transactions/TransactionType";
import { ContextualAddress } from "../../components/ContextualAddress";
import { KristValue } from "../../components/KristValue";
import { KristNameLink } from "../../components/KristNameLink";
import { TransactionConciseMetadata } from "../../components/transactions/TransactionConciseMetadata";
import { DateTime } from "../../components/DateTime";

import Debug from "debug";
const debug = Debug("kristweb:transactions-table");

interface Props {
  addresses?: string[];
  includeMined?: boolean;
  setError?: Dispatch<SetStateAction<Error | undefined>>;
}

export function TransactionsTable({ addresses, includeMined, setError }: Props): JSX.Element {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<LookupTransactionsResponse>();
  const [options, setOptions] = useState<LookupTransactionsOptions>({
    limit: 20,
    offset: 0,
    orderBy: "time",
    order: "DESC"
  });

  // Fetch the transactions from the API, mapping the table options
  useEffect(() => {
    debug("looking up transactions for %s", addresses ? addresses.join(",") : "network");
    setLoading(true);

    lookupTransactions(addresses, { ...options, includeMined })
      .then(setRes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [addresses, setError, options, includeMined ]);

  debug("results? %b  res.transactions.length: %d  res.count: %d  res.total: %d", !!res, res?.transactions?.length, res?.count, res?.total);

  return <Table<KristTransaction>
    className="transactions-table"
    size="small"

    loading={loading}
    dataSource={res?.transactions || []}
    rowKey="id"

    onChange={(pagination, _, sorter) => {
      const pageSize = (pagination?.pageSize) || 20;
      setOptions({
        ...options,

        limit: pageSize,
        offset: pageSize * ((pagination?.current || 1) - 1),

        orderBy: sorter instanceof Array ? undefined : sorter.field as SortableTransactionFields,
        order: sorter instanceof Array ? undefined : convertSorterOrder(sorter.order),
      });
    }}

    pagination={{
      size: "default",
      position: ["topRight", "bottomRight"],

      showSizeChanger: true,
      defaultPageSize: 20,

      total: res?.total || 0,
      showTotal: total => t("transactions.tableTotal", { count: total || 0 })
    }}

    columns={[
      // ID
      {
        title: t("transactions.columnID"),
        dataIndex: "id", key: "id",

        render: id => <>{id.toLocaleString()}</>,
        width: 100,
      },
      // Type
      {
        title: t("transactions.columnType"),
        dataIndex: "type", key: "type",
        render: (_, tx) => <TransactionType transaction={tx} />
      },

      // From
      {
        title: t("transactions.columnFrom"),
        dataIndex: "from", key: "from",

        render: (from, tx) => from && (
          <ContextualAddress
            className="transactions-table-address"
            address={from}
            metadata={tx.metadata}
            allowWrap
          />
        ),

        sorter: true
      },
      // To
      {
        title: t("transactions.columnTo"),
        dataIndex: "to", key: "to",

        render: (to, tx) => to && tx.type !== "name_a_record" && (
          <ContextualAddress
            className="transactions-table-address"
            address={to}
            metadata={tx.metadata}
            allowWrap
          />
        ),

        sorter: true
      },

      // Value
      {
        title: t("transactions.columnValue"),
        dataIndex: "value", key: "value",

        render: value => <KristValue value={value} />,
        width: 100,

        sorter: true
      },

      // Name
      {
        title: t("transactions.columnName"),
        dataIndex: "name", key: "name",

        render: name => <KristNameLink name={name} />,

        sorter: true
      },

      // Metadata
      {
        title: t("transactions.columnMetadata"),
        dataIndex: "metadata", key: "metadata",

        render: (_, transaction) => <TransactionConciseMetadata transaction={transaction} />,
        width: 260
      },

      // Time
      {
        title: t("transactions.columnTime"),
        dataIndex: "time", key: "time",
        render: time => <DateTime date={time} />,
        width: 200,

        sorter: true,
        defaultSortOrder: "descend"
      }
    ]}
  />;
}

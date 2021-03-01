// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Table } from "antd";

import { useTranslation } from "react-i18next";

import { KristTransaction } from "../../krist/api/types";
import { convertSorterOrder, lookupTransactions, LookupTransactionsOptions, LookupTransactionsResponse, LookupTransactionType, SortableTransactionFields } from "../../krist/api/lookup";

import { ListingType } from "./TransactionsPage";

import { TransactionType } from "../../components/transactions/TransactionType";
import { ContextualAddress } from "../../components/ContextualAddress";
import { KristValue } from "../../components/KristValue";
import { KristNameLink } from "../../components/KristNameLink";
import { TransactionConciseMetadata } from "../../components/transactions/TransactionConciseMetadata";
import { DateTime } from "../../components/DateTime";

import Debug from "debug";
const debug = Debug("kristweb:transactions-table");

// Received 'Cannot access LookupTransactionType before initialization' here,
// this is a crude workaround
const LISTING_TYPE_MAP: Record<ListingType, LookupTransactionType> = {
  [0]: LookupTransactionType.TRANSACTIONS,
  [1]: LookupTransactionType.TRANSACTIONS,
  [2]: LookupTransactionType.TRANSACTIONS,
  [3]: LookupTransactionType.NAME_HISTORY,
  [4]: LookupTransactionType.NAME_TRANSACTIONS
};

interface Props {
  listingType: ListingType;

  addresses?: string[];
  name?: string;

  includeMined?: boolean;
  setError?: Dispatch<SetStateAction<Error | undefined>>;
}

export function TransactionsTable({ listingType, addresses, name, includeMined, setError }: Props): JSX.Element {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<LookupTransactionsResponse>();
  const [options, setOptions] = useState<LookupTransactionsOptions>({
    limit: 20,
    offset: 0,
    orderBy: "time", // Equivalent to sorting by ID
    order: "DESC"
  });

  // Fetch the transactions from the API, mapping the table options
  useEffect(() => {
    debug("looking up transactions for %s", name || (addresses ? addresses.join(",") : "network"));
    setLoading(true);

    lookupTransactions(name ? [name] : addresses, {
      ...options,
      includeMined,
      type: LISTING_TYPE_MAP[listingType]
    })
      .then(setRes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [listingType, addresses, name, setError, options, includeMined]);

  debug("results? %b  res.transactions.length: %d  res.count: %d  res.total: %d", !!res, res?.transactions?.length, res?.count, res?.total);

  return <Table<KristTransaction>
    className="transactions-table"
    size="small"

    loading={loading}
    dataSource={res?.transactions || []}
    rowKey="id"

    // Triggered whenever the filter, sorting, or pagination changes
    onChange={(pagination, _, sorter) => {
      // While the pagination should never be undefined, it's important to
      // ensure that the default pageSize here is equal to the pagination's
      // default pageSize, otherwise ant-design will print a warning when the
      // data is first populated.
      const pageSize = (pagination?.pageSize) || 20;

      // This will trigger a data re-fetch
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
        width: 100

        // Don't allow sorting by ID to save a bit of width in the columns;
        // it's equivalent to sorting by time anyway
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

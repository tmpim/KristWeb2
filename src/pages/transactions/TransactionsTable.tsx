// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Table, TablePaginationConfig } from "antd";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { KristTransaction } from "@api/types";
import {
  lookupTransactions, LookupTransactionsOptions, LookupTransactionsResponse,
  LookupTransactionType
} from "@api/lookup";
import { useMalleablePagination, useTableHistory } from "@utils/table";

import { ListingType } from "./TransactionsPage";

import { TransactionType, TYPES_SHOW_VALUE } from "@comp/transactions/TransactionType";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { KristValue } from "@comp/krist/KristValue";
import { KristNameLink } from "@comp/names/KristNameLink";
import { TransactionConciseMetadata } from "@comp/transactions/TransactionConciseMetadata";
import { DateTime } from "@comp/DateTime";

import Debug from "debug";
const debug = Debug("kristweb:transactions-table");

// Received 'Cannot access LookupTransactionType before initialization' here,
// this is a crude workaround
const LISTING_TYPE_MAP: Record<ListingType, LookupTransactionType> = {
  [0]: LookupTransactionType.TRANSACTIONS,
  [1]: LookupTransactionType.TRANSACTIONS,
  [2]: LookupTransactionType.TRANSACTIONS,
  [3]: LookupTransactionType.NAME_HISTORY,
  [4]: LookupTransactionType.NAME_TRANSACTIONS,
  [5]: LookupTransactionType.SEARCH,
  [6]: LookupTransactionType.SEARCH,
  [7]: LookupTransactionType.SEARCH,
};

interface Props {
  listingType: ListingType;

  // Number used to trigger a refresh of the transactions listing
  refreshingID?: number;

  addresses?: string[];
  name?: string;
  query?: string;

  includeMined?: boolean;

  setError?: Dispatch<SetStateAction<Error | undefined>>;
  setPagination?: Dispatch<SetStateAction<TablePaginationConfig>>;
}

/** Map the search listing types to their API endpoint name */
function getLookupSearchType(listingType: ListingType): "address" | "name" | "metadata" | undefined {
  switch (listingType) {
  case ListingType.SEARCH_ADDRESS:
    return "address";
  case ListingType.SEARCH_NAME:
    return "name";
  case ListingType.SEARCH_METADATA:
    return "metadata";
  default: return undefined;
  }
}

export function TransactionsTable({
  listingType,
  refreshingID,
  addresses, name, query,
  includeMined,
  setError, setPagination
}: Props): JSX.Element {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<LookupTransactionsResponse>();
  const { options, setOptions } = useTableHistory<LookupTransactionsOptions>({
    orderBy: "time", // Equivalent to sorting by ID
    order: "DESC"
  });

  const { paginationTableProps, hotkeys } = useMalleablePagination(
    res, res?.transactions,
    "transactions.tableTotal",
    options, setOptions, setPagination
  );

  // Fetch the transactions from the API, mapping the table options
  useEffect(() => {
    debug(
      "looking up transactions (type: %d mapped: %d) for %s",
      listingType,
      LISTING_TYPE_MAP[listingType],
      name || (addresses ? addresses.join(",") : "network"),
      options
    );
    setLoading(true);

    const lookupQuery = query
      ? [query]
      : (name ? [name] : addresses);

    lookupTransactions(lookupQuery, {
      ...options,
      includeMined,
      type: LISTING_TYPE_MAP[listingType],
      searchType: getLookupSearchType(listingType)
    })
      .then(setRes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [listingType, refreshingID, addresses, name, query, setError, options, includeMined]);

  debug("results? %b  res.transactions.length: %d  res.count: %d  res.total: %d", !!res, res?.transactions?.length, res?.count, res?.total);

  const tbl = <Table<KristTransaction>
    className="transactions-table"
    size="small"

    loading={loading}
    dataSource={res?.transactions || []}
    rowKey="id"

    {...paginationTableProps}

    columns={[
      // ID
      {
        title: t("transactions.columnID"),
        dataIndex: "id", key: "id",

        render: id => (
          <Link to={`/network/transactions/${encodeURIComponent(id)}`}>
            {id.toLocaleString()}
          </Link>
        ),
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

        render: (from, tx) => from && tx.type !== "mined" && (
          <ContextualAddress
            className="transactions-table-address"
            address={from}
            metadata={tx.metadata}
            allowWrap
            source
          />
        ),

        sorter: true
      },
      // To
      {
        title: t("transactions.columnTo"),
        dataIndex: "to", key: "to",

        render: (to, tx) => to && tx.type !== "name_purchase" && tx.type !== "name_a_record" && (
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

        render: (value, tx) => TYPES_SHOW_VALUE.includes(tx.type) && (
          <KristValue value={value} />
        ),
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

  return <>
    {tbl}
    {hotkeys}
  </>;
}

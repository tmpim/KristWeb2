// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useCallback, useMemo, Dispatch, SetStateAction } from "react";
import classNames from "classnames";
import { Table, TablePaginationConfig } from "antd";
import { ColumnsType } from "antd/lib/table";

import { useTFns, TStrFn } from "@utils/i18n";
import { Link } from "react-router-dom";

import { KristTransaction } from "@api/types";
import {
  lookupTransactions, LookupTransactionsOptions, LookupTransactionsResponse,
  LookupTransactionType, SortableTransactionFields
} from "@api/lookup";
import {
  useMalleablePagination, useTableHistory, useDateColumnWidth, useMobileList,
  PaginationTableProps, RenderItem, SortOptions, SetOpenSortModalFn
} from "@utils/table/table";

import { ListingType } from "./TransactionsPage";

import { TransactionItem } from "@comp/transactions/TransactionItem";
import { TransactionType, TYPES_SHOW_VALUE } from "@comp/transactions/TransactionType";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { getVerified } from "@comp/addresses/VerifiedAddress";
import { KristValue } from "@comp/krist/KristValue";
import { KristNameLink } from "@comp/names/KristNameLink";
import { TransactionConciseMetadata } from "@comp/transactions/TransactionConciseMetadata";
import { DateTime } from "@comp/DateTime";

import { useWallets } from "@wallets";
import { useBooleanSetting } from "@utils/settings";

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
  setOpenSortModal?: SetOpenSortModalFn;
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

function getColumns(
  tStr: TStrFn,
  dateColumnWidth: number
): ColumnsType<KristTransaction> {
  return [
    // ID
    {
      title: tStr("columnID"),
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
      title: tStr("columnType"),
      dataIndex: "type", key: "type",
      render: (_, tx) => <TransactionType transaction={tx} />
    },

    // From
    {
      title: tStr("columnFrom"),
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
      title: tStr("columnTo"),
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
      title: tStr("columnValue"),
      dataIndex: "value", key: "value",

      render: (value, tx) => TYPES_SHOW_VALUE.includes(tx.type) && (
        <KristValue value={value} />
      ),
      width: 100,

      sorter: true
    },

    // Name
    {
      title: tStr("columnName"),
      dataIndex: "name", key: "name",

      render: name => <KristNameLink name={name} />
    },

    // Metadata
    {
      title: tStr("columnMetadata"),
      dataIndex: "metadata", key: "metadata",

      render: (_, transaction) => <TransactionConciseMetadata transaction={transaction} />,
      width: 260
    },

    // Time
    {
      title: tStr("columnTime"),
      dataIndex: "time", key: "time",
      render: time => <DateTime date={time} />,
      width: dateColumnWidth,

      sorter: true,
      defaultSortOrder: "descend"
    }
  ];
}

const sortOptions: SortOptions<SortableTransactionFields> = [
  { sortKey: "from", i18nKey: "transactionsFrom" },
  { sortKey: "to", i18nKey: "transactionsTo" },
  { sortKey: "value", i18nKey: "transactionsValue" },
  { sortKey: "time", i18nKey: "transactionsTime" }
];
const defaultOrderBy = "time"; // Equivalent to sorting by ID
const defaultOrder = "DESC";

export function TransactionsTable({
  listingType,
  refreshingID,
  addresses, name, query,
  includeMined,
  setError, setPagination, setOpenSortModal
}: Props): JSX.Element {
  const { tKey } = useTFns("transactions.");

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<LookupTransactionsResponse>();
  const { options, setOptions } = useTableHistory<LookupTransactionsOptions>({
    orderBy: defaultOrderBy, order: defaultOrder
  });

  const { paginationTableProps, paginationChange, hotkeys } = useMalleablePagination(
    res, res?.transactions,
    tKey("tableTotal"),
    options, setOptions, setPagination
  );

  const { walletAddressMap, joinedAddressList } = useWallets();
  const highlightOwn = useBooleanSetting("transactionsHighlightOwn") &&
    listingType !== ListingType.WALLETS;
  const highlightVerified = useBooleanSetting("transactionsHighlightVerified");

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

  const renderMobileItem: RenderItem<KristTransaction> = useCallback(tx => (
    <TransactionItem
      transaction={tx}
      wallets={walletAddressMap}
    />
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [joinedAddressList]);

  const { isMobile, list } = useMobileList(
    loading, res?.transactions || [], "id",
    paginationTableProps.pagination, paginationChange,
    sortOptions, defaultOrderBy, defaultOrder,
    options, setOptions, setOpenSortModal,
    renderMobileItem
  );

  return <>
    {isMobile && list
      ? list
      : <DesktopView
        loading={loading}
        res={res}

        paginationTableProps={paginationTableProps}

        highlightOwn={highlightOwn}
        highlightVerified={highlightVerified}
      />}
    {hotkeys}
  </>;
}

interface DesktopViewProps {
  loading: boolean;
  res?: LookupTransactionsResponse;

  paginationTableProps: PaginationTableProps<KristTransaction>;

  highlightOwn: boolean;
  highlightVerified: boolean;
}

function DesktopView({
  loading, res,
  paginationTableProps,
  highlightOwn, highlightVerified
}: DesktopViewProps): JSX.Element {
  const { tStr } = useTFns("transactions.");

  const { walletAddressMap, joinedAddressList } = useWallets();
  const dateColumnWidth = useDateColumnWidth();

  const columns = useMemo(() => getColumns(
    tStr, dateColumnWidth
  ), [tStr, dateColumnWidth]);

  const getRowClasses = useCallback((tx: KristTransaction): string => {
    return classNames({
      // Highlight own transactions
      "transaction-row-own": highlightOwn
        && ((tx.from && walletAddressMap[tx.from])
        || (tx.to && walletAddressMap[tx.to])),

      // Highlight verified addresses
      "transaction-row-verified": highlightVerified
        && (!!getVerified(tx.from) || !!getVerified(tx.to)),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightOwn, highlightVerified, joinedAddressList]);

  return <Table<KristTransaction>
    className="transactions-table"
    size="small"
    scroll={{ x: true }}

    loading={loading}
    dataSource={res?.transactions || []}
    rowKey="id"

    {...paginationTableProps}

    // Highlight own transactions and verified addresses
    rowClassName={getRowClasses}

    columns={columns}
  />;
}

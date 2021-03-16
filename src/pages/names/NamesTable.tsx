// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Table, TablePaginationConfig, Tag } from "antd";

import { useTranslation } from "react-i18next";

import { KristName } from "@api/types";
import { lookupNames, LookupNamesOptions, LookupNamesResponse } from "@api/lookup";
import {
  useMalleablePagination, useTableHistory, useDateColumnWidth
} from "@utils/table";

import { useWallets } from "@wallets";
import { NameActions } from "./mgmt/NameActions";

import { KristNameLink } from "@comp/names/KristNameLink";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { TransactionConciseMetadata } from "@comp/transactions/TransactionConciseMetadata";
import { DateTime } from "@comp/DateTime";

import Debug from "debug";
const debug = Debug("kristweb:names-table");

interface Props {
  // Number used to trigger a refresh of the names listing
  refreshingID?: number;

  // Whether or not to sort by newest first by default
  sortNew?: boolean;

  addresses?: string[];
  setError?: Dispatch<SetStateAction<Error | undefined>>;
  setPagination?: Dispatch<SetStateAction<TablePaginationConfig>>;
}

export function NamesTable({ refreshingID, sortNew, addresses, setError, setPagination }: Props): JSX.Element {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<LookupNamesResponse>();
  const { options, setOptions } = useTableHistory<LookupNamesOptions>({
    orderBy: sortNew ? "registered" : "name",
    order: sortNew ? "DESC" : "ASC"
  });

  const { paginationTableProps, hotkeys } = useMalleablePagination(
    res, res?.names,
    "names.tableTotal",
    options, setOptions, setPagination
  );

  const dateColumnWidth = useDateColumnWidth();

  // Used to change the actions depending on whether or not we own the name
  const { walletAddressMap } = useWallets();

  // Fetch the names from the API, mapping the table options
  useEffect(() => {
    debug("looking up names for %s", addresses ? addresses.join(",") : "network");
    setLoading(true);

    lookupNames(addresses, options)
      .then(setRes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [refreshingID, addresses, setError, options]);

  debug("results? %b  res.names.length: %d  res.count: %d  res.total: %d", !!res, res?.names?.length, res?.count, res?.total);

  const tbl = <Table<KristName>
    className="names-table"
    size="small"

    loading={loading}
    dataSource={res?.names || []}
    rowKey="name"

    {...paginationTableProps}

    rowClassName={name => name.unpaid > 0 ? "name-row-unpaid" : ""}

    columns={[
      // Name
      {
        title: t("names.columnName"),
        dataIndex: "name", key: "name",

        render: name => <KristNameLink name={name} />,

        sorter: true,
        defaultSortOrder: sortNew ? undefined : "ascend"
      },

      // Owner
      {
        title: t("names.columnOwner"),
        dataIndex: "owner", key: "owner",

        render: owner => owner && (
          <ContextualAddress
            className="names-table-address"
            address={owner}
            allowWrap
          />
        ),

        sorter: true
      },

      // Original owner
      {
        title: t("names.columnOriginalOwner"),
        dataIndex: "original_owner", key: "original_owner",

        render: owner => owner && (
          <ContextualAddress
            className="names-table-address"
            address={owner}
            allowWrap
          />
        ),

        sorter: true
      },

      // A record
      {
        title: t("names.columnARecord"),
        dataIndex: "a", key: "a",

        render: a => <TransactionConciseMetadata metadata={a} />,

        sorter: true
      },

      // Unpaid blocks
      {
        title: t("names.columnUnpaid"),
        dataIndex: "unpaid", key: "unpaid",

        render: unpaid => unpaid > 0
          ? <Tag color="CornFlowerBlue">{unpaid.toLocaleString()}</Tag>
          : <></>,
        width: 50,

        sorter: true
      },

      // Registered time
      {
        title: t("names.columnRegistered"),
        dataIndex: "registered", key: "registered",

        render: time => <DateTime date={time} />,
        width: dateColumnWidth,

        sorter: true,
        defaultSortOrder: sortNew ? "descend" : undefined
      },

      // Updated time
      {
        title: t("names.columnUpdated"),
        dataIndex: "updated", key: "updated",

        render: time => <DateTime date={time} />,
        width: dateColumnWidth,

        sorter: true
      },

      // Actions
      {
        key: "actions",
        width: 100, // Force it to be minimum size
        render: (_, record) => (
          <NameActions
            name={record}
            isOwn={!!walletAddressMap[record.owner]}
          />
        )
      }
    ]}
  />;

  return <>
    {tbl}
    {hotkeys}
  </>;
}

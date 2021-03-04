// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Table, TablePaginationConfig } from "antd";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { KristBlock } from "../../krist/api/types";
import { lookupBlocks, LookupBlocksOptions, LookupBlocksResponse } from "../../krist/api/lookup";
import { useMalleablePagination } from "../../utils/table";
import { useIntegerSetting } from "../../utils/settings";

import { ContextualAddress } from "../../components/addresses/ContextualAddress";
import { BlockHash } from "./BlockHash";
import { KristValue } from "../../components/krist/KristValue";
import { DateTime } from "../../components/DateTime";

import Debug from "debug";
const debug = Debug("kristweb:blocks-table");

interface Props {
  // Number used to trigger a refresh of the blocks listing
  refreshingID?: number;
  lowest?: boolean;

  setError?: Dispatch<SetStateAction<Error | undefined>>;
  setPagination?: Dispatch<SetStateAction<TablePaginationConfig>>;
}

export function BlocksTable({ refreshingID, lowest, setError, setPagination }: Props): JSX.Element {
  const { t } = useTranslation();

  const defaultPageSize = useIntegerSetting("defaultPageSize");

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<LookupBlocksResponse>();
  const [options, setOptions] = useState<LookupBlocksOptions>({
    limit: defaultPageSize,
    offset: 0,
    orderBy: lowest ? "hash" : "height",
    order: lowest ? "ASC" : "DESC"
  });

  const { paginationTableProps } = useMalleablePagination(
    res, res?.blocks,
    "blocks.tableTotal",
    options, setOptions, setPagination
  );

  // Fetch the blocks from the API, mapping the table options
  useEffect(() => {
    debug("looking up blocks");
    setLoading(true);

    lookupBlocks(options)
      .then(setRes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [refreshingID, setError, options]);

  debug("results? %b  res.blocks.length: %d  res.count: %d  res.total: %d", !!res, res?.blocks?.length, res?.count, res?.total);

  return <Table<KristBlock>
    className="blocks-table"
    size="small"

    loading={loading}
    dataSource={res?.blocks || []}
    rowKey="height"

    {...paginationTableProps}

    columns={[
      // Height
      {
        title: t("blocks.columnHeight"),
        dataIndex: "height", key: "height",

        render: height => (
          <Link to={`/network/blocks/${encodeURIComponent(height)}`}>
            {height.toLocaleString()}
          </Link>
        ),
        width: 100
      },

      // Miner address
      {
        title: t("blocks.columnAddress"),
        dataIndex: "address", key: "address",

        render: address => address && (
          <ContextualAddress
            className="blocks-table-address"
            address={address}
            allowWrap
          />
        ),

        sorter: true
      },

      // Hash
      {
        title: t("blocks.columnHash"),
        dataIndex: "hash", key: "hash",

        render: hash => <BlockHash hash={hash} />,

        sorter: true,
        defaultSortOrder: lowest ? "ascend" : undefined
      },

      // Value
      {
        title: t("blocks.columnValue"),
        dataIndex: "value", key: "value",

        render: value => <KristValue value={value} />,
        width: 100,

        sorter: true
      },

      // Difficulty
      {
        title: t("blocks.columnDifficulty"),
        dataIndex: "difficulty", key: "difficulty",

        render: difficulty => difficulty.toLocaleString(),

        sorter: true
      },

      // Time
      {
        title: t("blocks.columnTime"),
        dataIndex: "time", key: "time",
        render: time => <DateTime date={time} />,
        width: 200,

        sorter: true,
        defaultSortOrder: lowest ? undefined : "descend"
      }
    ]}
  />;
}

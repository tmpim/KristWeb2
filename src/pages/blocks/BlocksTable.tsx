// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { Table, TablePaginationConfig } from "antd";
import { ColumnsType } from "antd/lib/table";

import { useTFns, TStrFn } from "@utils/i18n";
import { Link } from "react-router-dom";

import { KristBlock } from "@api/types";
import { lookupBlocks, LookupBlocksOptions, LookupBlocksResponse } from "@api/lookup";
import {
  useMalleablePagination, useTableHistory, useDateColumnWidth
} from "@utils/table";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { BlockHash } from "./BlockHash";
import { KristValue } from "@comp/krist/KristValue";
import { DateTime } from "@comp/DateTime";

import Debug from "debug";
const debug = Debug("kristweb:blocks-table");

interface Props {
  // Number used to trigger a refresh of the blocks listing
  refreshingID?: number;
  lowest?: boolean;

  setError?: Dispatch<SetStateAction<Error | undefined>>;
  setPagination?: Dispatch<SetStateAction<TablePaginationConfig>>;
}

function getColumns(
  tStr: TStrFn,
  dateColumnWidth: number,
  lowest: boolean | undefined
): ColumnsType<KristBlock> {
  return [
    // Height
    {
      title: tStr("columnHeight"),
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
      title: tStr("columnAddress"),
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
      title: tStr("columnHash"),
      dataIndex: "hash", key: "hash",

      render: hash => <BlockHash hash={hash} />,

      sorter: true,
      defaultSortOrder: lowest ? "ascend" : undefined
    },

    // Value
    {
      title: tStr("columnValue"),
      dataIndex: "value", key: "value",

      render: value => <KristValue value={value} />,
      width: 100,

      sorter: true
    },

    // Difficulty
    {
      title: tStr("columnDifficulty"),
      dataIndex: "difficulty", key: "difficulty",

      render: difficulty => difficulty.toLocaleString(),

      sorter: true
    },

    // Time
    {
      title: tStr("columnTime"),
      dataIndex: "time", key: "time",
      render: time => <DateTime date={time} />,
      width: dateColumnWidth,

      sorter: true,
      defaultSortOrder: lowest ? undefined : "descend"
    }
  ];
}

export function BlocksTable({ refreshingID, lowest, setError, setPagination }: Props): JSX.Element {
  const { tStr, tKey } = useTFns("blocks.");

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<LookupBlocksResponse>();
  const { options, setOptions } = useTableHistory<LookupBlocksOptions>({
    orderBy: lowest ? "hash" : "height",
    order: lowest ? "ASC" : "DESC"
  });

  const { paginationTableProps, hotkeys } = useMalleablePagination(
    res, res?.blocks,
    tKey("tableTotal"),
    options, setOptions, setPagination
  );

  const dateColumnWidth = useDateColumnWidth();

  const columns = useMemo(() => getColumns(
    tStr, dateColumnWidth, lowest
  ), [tStr, dateColumnWidth, lowest]);

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

  const tbl = <Table<KristBlock>
    className="blocks-table"
    size="small"

    loading={loading}
    dataSource={res?.blocks || []}
    rowKey="height"

    {...paginationTableProps}

    columns={columns}
  />;

  return <>
    {tbl}
    {hotkeys}
  </>;
}

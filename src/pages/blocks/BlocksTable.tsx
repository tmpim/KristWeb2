// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useMemo, useCallback, Dispatch, SetStateAction } from "react";
import { Table, TablePaginationConfig } from "antd";
import { ColumnsType } from "antd/lib/table";

import { useTFns, TStrFn } from "@utils/i18n";
import { Link } from "react-router-dom";

import { KristBlock } from "@api/types";
import {
  lookupBlocks, LookupBlocksOptions, LookupBlocksResponse, SortableBlockFields
} from "@api/lookup";
import {
  useMalleablePagination, useTableHistory, useDateColumnWidth, useMobileList,
  PaginationTableProps, RenderItem, SortOptions, SetOpenSortModalFn
} from "@utils/table/table";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { BlockHash } from "./BlockHash";
import { KristValue } from "@comp/krist/KristValue";
import { DateTime } from "@comp/DateTime";

import { BlockMobileItem } from "./BlockMobileItem";

import Debug from "debug";
const debug = Debug("kristweb:blocks-table");

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

const sortOptions: SortOptions<SortableBlockFields> = [
  { sortKey: "address", i18nKey: "blocksMiner" },
  { sortKey: "hash", i18nKey: "blocksHash" },
  { sortKey: "value", i18nKey: "blocksValue" },
  { sortKey: "difficulty", i18nKey: "blocksDifficulty" },
  { sortKey: "time", i18nKey: "blocksTime" }
];

interface Props {
  // Number used to trigger a refresh of the blocks listing
  refreshingID?: number;
  lowest?: boolean;

  setError?: Dispatch<SetStateAction<Error | undefined>>;
  setPagination?: Dispatch<SetStateAction<TablePaginationConfig>>;
  setOpenSortModal?: SetOpenSortModalFn;
}

export function BlocksTable({
  refreshingID,
  lowest,
  setError,
  setPagination,
  setOpenSortModal
}: Props): JSX.Element {
  const { tKey } = useTFns("blocks.");

  const defaultOrderBy = lowest ? "hash" : "time";
  const defaultOrder = lowest ? "ASC" : "DESC";

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<LookupBlocksResponse>();
  const { options, setOptions } = useTableHistory<LookupBlocksOptions>({
    orderBy: defaultOrderBy, order: defaultOrder
  });

  const { paginationTableProps, paginationChange, hotkeys } = useMalleablePagination(
    res, res?.blocks,
    tKey("tableTotal"),
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

  const renderMobileItem: RenderItem<KristBlock> = useCallback(block => (
    <BlockMobileItem block={block} />
  ), []);

  const { isMobile, list } = useMobileList(
    loading, res?.blocks || [], "height",
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

        lowest={lowest}

        paginationTableProps={paginationTableProps}
      />}
    {hotkeys}
  </>;
}

interface DesktopViewProps {
  loading: boolean;
  res?: LookupBlocksResponse;

  lowest?: boolean;

  paginationTableProps: PaginationTableProps<KristBlock>;
}

function DesktopView({
  loading, res,
  lowest,
  paginationTableProps,
}: DesktopViewProps): JSX.Element {
  const { tStr } = useTFns("blocks.");

  const dateColumnWidth = useDateColumnWidth();

  const columns = useMemo(() => getColumns(
    tStr, dateColumnWidth, lowest
  ), [tStr, dateColumnWidth, lowest]);

  return <Table<KristBlock>
    className="blocks-table"
    size="small"
    scroll={{ x: true }}

    loading={loading}
    dataSource={res?.blocks || []}
    rowKey="height"

    {...paginationTableProps}

    columns={columns}
  />;
}

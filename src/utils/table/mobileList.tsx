// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo, ReactNode } from "react";
import { List } from "antd";
import { PaginationConfig } from "antd/lib/pagination";

import { PaginationChangeFn, LookupFilterOptionsBase } from "@utils/table/table";
import { useSortModal, SetOpenSortModalFn, SortOptions } from "./SortModal";

import { useBreakpoint } from "@utils/hooks";

interface MobileListHookRes {
  isMobile: boolean;
  list: JSX.Element | null;
}

export type RenderItem<T> = (item: T, index: number) => ReactNode;

/** Returns a mobile-specific list view if the screen is small enough. */
export function useMobileList<T, FieldsT extends string>(
  loading: boolean,
  res: T[],
  rowKey: string,

  paginationConfig: Omit<PaginationConfig, "position"> | false | undefined,
  paginationChange: PaginationChangeFn,

  sortOptions: SortOptions<FieldsT>,
  defaultOrderBy: FieldsT,
  defaultOrder: "ASC" | "DESC",

  options: LookupFilterOptionsBase<FieldsT>,
  setOptions: (opts: LookupFilterOptionsBase<FieldsT>) => void,
  setOpenSortModal: SetOpenSortModalFn | undefined,

  renderItem: (item: T, index: number) => ReactNode
): MobileListHookRes {
  const bps = useBreakpoint();
  const isMobile = !bps.md;

  console.log(paginationConfig);
  console.log(options);

  const sortModal = useSortModal(
    sortOptions, defaultOrderBy, defaultOrder,
    options, setOptions, setOpenSortModal
  );

  const pagination: PaginationConfig = useMemo(() => ({
    ...paginationConfig,
    position: "bottom",
    onChange: paginationChange
  }), [paginationConfig, paginationChange]);

  const list = useMemo(() => {
    if (!isMobile) return null;

    return <>
      <List
        loading={loading}
        dataSource={res}
        rowKey={rowKey}

        className="table-mobile-list-view"

        itemLayout="vertical"
        pagination={pagination}

        renderItem={renderItem}
      />

      {sortModal}
    </>;
  }, [isMobile, loading, res, rowKey, pagination, renderItem, sortModal]);

  return { isMobile, list };
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo, ReactNode } from "react";
import { List } from "antd";
import { PaginationConfig } from "antd/lib/pagination";

import { PaginationChangeFn } from "@utils/table/table";
import { useBreakpoint } from "@utils/hooks";

interface MobileListHookRes {
  isMobile: boolean;
  list: JSX.Element | null;
}

export type RenderItem<T> = (item: T, index: number) => ReactNode;

/** Returns a mobile-specific list view if the screen is small enough. */
export function useMobileList<T>(
  loading: boolean,
  res: T[],
  rowKey: string,
  paginationConfig: Omit<PaginationConfig, "position"> | false | undefined,
  paginationChange: PaginationChangeFn,
  renderItem: (item: T, index: number) => ReactNode
): MobileListHookRes {
  const bps = useBreakpoint();
  const isMobile = !bps.md;

  console.log(paginationConfig);

  const pagination: PaginationConfig = useMemo(() => ({
    ...paginationConfig,
    position: "bottom",
    onChange: paginationChange
  }), [paginationConfig, paginationChange]);

  const list = useMemo(() => {
    if (!isMobile) return null;

    return <List
      loading={loading}
      dataSource={res}
      rowKey={rowKey}

      className="table-mobile-list-view"

      itemLayout="vertical"
      pagination={pagination}

      renderItem={renderItem}
    />;
  }, [isMobile, loading, res, rowKey, pagination, renderItem]);

  return { isMobile, list };
}

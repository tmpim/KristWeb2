// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Dispatch, SetStateAction } from "react";
import { TablePaginationConfig } from "antd";
import { SorterResult } from "antd/lib/table/interface";

import { TFunction } from "react-i18next";

export interface LookupFilterOptionsBase<FieldsT extends string> {
  limit?: number;
  offset?: number;
  orderBy?: FieldsT;
  order?: "ASC" | "DESC";
}

export interface LookupResultsBase {
  count: number;
  total: number;
}

export const handleLookupTableChange = <ResultT, FieldsT extends string>(setOptions: Dispatch<SetStateAction<LookupFilterOptionsBase<FieldsT>>>) =>
  (pagination: TablePaginationConfig, _: unknown, sorter: SorterResult<ResultT> | SorterResult<ResultT>[]): void => {
    const pageSize = (pagination?.pageSize) || 20;

    // This will trigger a data re-fetch
    setOptions({
      limit: pageSize,
      offset: pageSize * ((pagination?.current || 1) - 1),

      orderBy: sorter instanceof Array ? undefined : sorter.field as FieldsT,
      order: sorter instanceof Array ? undefined : convertSorterOrder(sorter.order),
    });
  };

export const getTablePaginationSettings = <ResultT extends LookupResultsBase>(t: TFunction, res: ResultT | undefined, totalKey: string): TablePaginationConfig => ({
  size: "default",
  position: ["topRight", "bottomRight"],

  showSizeChanger: true,
  defaultPageSize: 20,

  total: res?.total || 0,
  showTotal: total => t(totalKey, { count: total || 0 })
});

export function convertSorterOrder(order: "descend" | "ascend" | null | undefined): "ASC" | "DESC" | undefined {
  switch (order) {
  case "ascend":
    return "ASC";
  case "descend":
    return "DESC";
  }
}

export function getFilterOptionsQuery(opts: LookupFilterOptionsBase<string>): URLSearchParams {
  const qs = new URLSearchParams();
  if (opts.limit) qs.append("limit", opts.limit.toString());
  if (opts.offset) qs.append("offset", opts.offset.toString());
  if (opts.orderBy) qs.append("orderBy", opts.orderBy);
  if (opts.order) qs.append("order", opts.order);
  return qs;
}

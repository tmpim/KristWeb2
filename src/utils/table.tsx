// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { TablePaginationConfig, TableProps, Pagination } from "antd";
import { SorterResult } from "antd/lib/table/interface";
import usePagination from "antd/lib/table/hooks/usePagination";

import { useTranslation, TFunction } from "react-i18next";
import { useIntegerSetting } from "./settings";

import { useHistory, useLocation } from "react-router-dom";

import Debug from "debug";
const debug = Debug("kristweb:table");

export interface LookupFilterOptionsBase<FieldsT extends string> {
  limit?: number;
  offset?: number;
  orderBy?: FieldsT;
  order?: "ASC" | "DESC";
}

export interface LookupResponseBase {
  count: number;
  total: number;
}

export const handleLookupTableChange = <ResultT, FieldsT extends string>(
  defaultPageSize: number,
  setOptions: (opts: LookupFilterOptionsBase<FieldsT>) => void,
  setPaginationPos?: Dispatch<SetStateAction<TablePaginationConfig>>
) =>
    (pagination: TablePaginationConfig, _: unknown, sorter: SorterResult<ResultT> | SorterResult<ResultT>[]): void => {
      if (!pagination?.pageSize)
        debug("pagination doesn't have pageSize!", pagination?.pageSize, pagination);

      const pageSize = (pagination?.pageSize) || defaultPageSize;

      // Update any linked pagination elements
      if (setPaginationPos && pagination) {
        setPaginationPos({
          current: pagination.current,
          pageSize: pagination.pageSize
        });
      }

      // This will trigger a data re-fetch
      setOptions({
        limit: pageSize,
        offset: pageSize * ((pagination?.current || 1) - 1),

        orderBy: sorter instanceof Array ? undefined : sorter.field as FieldsT,
        order: sorter instanceof Array ? undefined : convertSorterOrder(sorter.order),
      });
    };

/** De-duplicates, sorts, and returns a list of page size options for table
 * pagination, including the user's custom one (if set). */
export function getPageSizes(defaultPageSize: number): string[] {
  // De-duplicate the sizes if a default one is already in here
  const sizes = [...new Set([10, 15, 20, 50, 100, defaultPageSize])];
  sizes.sort((a, b) => a - b);
  return sizes.map(s => s.toString());
}

export const getTablePaginationConfig = <ResponseT extends LookupResponseBase>(
  t: TFunction,
  res: ResponseT | undefined,
  totalKey: string,
  defaultPageSize: number,
  existingConfig?: TablePaginationConfig
): TablePaginationConfig => ({
    ...existingConfig,

    size: "default",
    position: ["bottomRight"],

    showSizeChanger: true,
    defaultPageSize,
    pageSizeOptions: getPageSizes(defaultPageSize),

    total: res?.total || 0,
    showTotal: total => t(totalKey, { count: total || 0 }),
  });

export function useMalleablePagination<
  ResultT,
  ResponseT extends LookupResponseBase,
  FieldsT extends string
>(
  res: ResponseT | undefined,
  results: ResultT[] | undefined, // Only really used for type inference
  totalKey: string,
  options: LookupFilterOptionsBase<FieldsT>,
  setOptions: (opts: LookupFilterOptionsBase<FieldsT>) => void,
  setPagination?: Dispatch<SetStateAction<TablePaginationConfig>>
): {
  paginationTableProps: Pick<TableProps<ResultT>, "onChange" | "pagination">;
} {
  const { t } = useTranslation();

  // The currentPageSize and currentPage may be provided by the useTableHistory
  // hook, which gets the values from the browser state
  const defaultPageSize = useIntegerSetting("defaultPageSize");
  const currentPageSize = options.limit ?? defaultPageSize;
  const currentPage = options.offset
    ? Math.max(Math.floor(options.offset / currentPageSize) + 1, 1)
    : 1;

  // All this is done to allow putting the pagination in the page header
  const [paginationPos, setPaginationPos] = useState<TablePaginationConfig>({
    current: currentPage,
    pageSize: currentPageSize
  });
  const paginationConfig = getTablePaginationConfig(t, res, totalKey, currentPageSize, paginationPos);
  debug(defaultPageSize, currentPageSize, currentPage, paginationPos, paginationConfig);
  const [mergedPagination] = usePagination(
    results?.length || 0,
    paginationConfig,
    (current, pageSize) => {
      // Can't use onChange directly here unfortunately
      debug("linked pagination called onChange with %d, %d", current, pageSize);

      setPaginationPos({ current, pageSize });
      setOptions({
        ...options,
        limit: pageSize,
        offset: pageSize * ((current || 1) - 1)
      });
    }
  );

  // Update the pagination
  useEffect(() => {
    if (setPagination) {
      const ret: TablePaginationConfig = { ...mergedPagination };
      if (paginationPos?.current) ret.current = paginationPos.current;
      if (paginationPos?.pageSize) ret.pageSize = paginationPos.pageSize;
      setPagination(ret);
    }
  }, [res, options, mergedPagination, paginationPos, setPagination]);

  return {
    paginationTableProps: {
      onChange: handleLookupTableChange(defaultPageSize, setOptions, setPaginationPos),
      pagination: paginationConfig
    }
  };
}

export function useLinkedPagination(): [
  JSX.Element,
  Dispatch<SetStateAction<TablePaginationConfig>>
  ] {
  // Used to display the pagination in the page header
  const [pagination, setPagination] = useState<TablePaginationConfig>({});

  const paginationComponent = useMemo(() => (
    <Pagination
      className="ant-pagination ant-pagination-topRight"
      {...pagination}
    />
  ), [pagination]);

  return [paginationComponent, setPagination];
}

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

/** Wraps the setOptions for a table, providing a sane default page size,
 * and storing state changes in the history stack. When the page is returned to,
 * the history stack is checked and location state is used as defaults. */
export function useTableHistory<
  OptionsT extends LookupFilterOptionsBase<string>
>(
  defaults: Partial<OptionsT> & Pick<OptionsT, "orderBy" | "order">
): {
  options: OptionsT;
  setOptions: (opts: OptionsT) => void;
} {
  // Used to get/set the browser history state
  const history = useHistory();
  const location = useLocation<Partial<OptionsT>>();
  const { state } = location;

  const defaultPageSize = useIntegerSetting("defaultPageSize");

  // The table filter parameters
  const [options, setOptions] = useState<OptionsT>({
    limit: state?.limit ?? defaults.limit ?? defaultPageSize,
    offset: state?.offset ?? defaults.offset ?? 0,
    orderBy: state?.orderBy ?? defaults.orderBy,
    order: state?.order ?? defaults.order
  } as OptionsT);

  function wrappedSetOptions(opts: OptionsT) {
    debug("table calling setOptions:", opts);
    updateLocation(opts);
    return setOptions(opts);
  }

  // Merge the options and extra state into the location state and replace the
  // entry on the history stack.
  function updateLocation(opts?: OptionsT) {
    const updatedLocation = {
      ...location,
      state: {
        ...location?.state,
        ...(opts ?? {})
      }
    };

    debug("replacing updated location:", updatedLocation);
    history.replace(updatedLocation);
  }

  return { options, setOptions: wrappedSetOptions };
}

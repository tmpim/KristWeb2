import { ReactNode } from "react";

export enum SortDirection {
  ASC, DESC
}

export interface ColumnSpec<DataT> {
  /** i18n key for column/header name */
  nameKey: string;
  sortable?: boolean;

  /** Whether or not a cell's contents should have text wrapping disabled 
    (default: true) */
  nowrap?: boolean;
  skeletonEmWidth?: number;

  /** Optional function to format the value as a ReactNode */
  formatValue?: (key: ColumnKey<DataT>, value: DataT) => ReactNode;
}

export type ColumnKey<DataT> = Extract<keyof DataT, string>;
export type Columns<DataT> = Map<ColumnKey<DataT>, ColumnSpec<DataT>>;

// Basic properties defining the search query
export interface QueryStateBase<T> {
  orderBy?: ColumnKey<T>;
  order?: SortDirection;

  page?: number;
}

// Basic properties defining the results and the total count available
export interface DataResultBase<T> {
  total?: number;
  data?: T[];  
}

// Basic properties defining the state of the results
export interface DataStateBase<T> extends DataResultBase<T> {
  loading: boolean;
}

export type DataProvider<T> = (query: QueryStateBase<T>) => Promise<DataResultBase<T>>;

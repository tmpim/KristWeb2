import React, { Component, ReactNode } from "react";

import Table from "react-bootstrap/Table";

import { Columns, ColumnKey, SortDirection, QueryStateBase, DataStateBase } from "./DataProvider";
import { ColumnHeader } from "./ColumnHeader";
import { ListTableRow } from "./ListTableRow";
import { ListTableSkeletonRows } from "./ListTableSkeletonRows";

import "./ListTable.scss";

interface Props<T> extends QueryStateBase<T>, DataStateBase<T> {
  columns: Columns<T>;

  setSort: (orderBy?: ColumnKey<T>, order?: SortDirection) => void;
}

export class ListTable<T> extends Component<Props<T>> {
  render(): ReactNode {
    const { columns, orderBy, order, loading, data, setSort } = this.props;

    // Render the table
    return <Table borderless hover className={loading ? "loading" : ""}>
      {/* Table headers, defined by the column map in the props */}
      <thead>
        <tr>
          {Array.from(columns, ([columnKey, columnSpec]) => 
            (<ColumnHeader
              key={columnKey} 
              columnKey={columnKey} 
              columnSpec={columnSpec}
              sortDirection={orderBy === columnKey ? order : undefined} 
              onSort={setSort}
            />))}
        </tr>
      </thead>

      {/* Table rows */}
      <tbody>
        {/* Render skeleton rows if the table is loading */}
        {loading && <ListTableSkeletonRows columns={columns} />}

        {/* Otherwise, render the data */}
        {!loading && data && data.map((row, i) => <ListTableRow
          key={i}
          columns={columns}
          data={row}
        />)}
      </tbody>
    </Table>;
  }
}

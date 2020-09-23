import React, { ReactNode, Component } from "react";

import { Translation } from "react-i18next";

import { ColumnKey, ColumnSpec, SortDirection } from "./DataProvider";

import "./ColumnHeader.scss";

interface Props<T> {
  columnKey: ColumnKey<T>;
  columnSpec: ColumnSpec<T>;

  sortDirection?: SortDirection;

  onSort: (columnKey?: ColumnKey<T>, direction?: SortDirection) => void;
}

export class ColumnHeader<T> extends Component<Props<T>> {
  onClickSort(): void {
    const { columnKey, sortDirection: oldDirection, onSort } = this.props;
    
    if (oldDirection === undefined) // NONE -> ASC
      onSort(columnKey, SortDirection.ASC);
    else if (oldDirection === SortDirection.ASC) // ASC -> DESC
      onSort(columnKey, SortDirection.DESC);
    else if (oldDirection === SortDirection.DESC) // DESC -> NONE
      onSort(undefined, undefined);
  }

  render(): ReactNode {
    const { columnSpec, sortDirection } = this.props;
    
    // If 'sortable' is undefined, then assume it is sortable
    const sortable = columnSpec.sortable === undefined || columnSpec.sortable;

    // Decide which sort button to render
    const sortButton = () => {
      const sort = () => this.onClickSort();

      switch (sortDirection) {
      case SortDirection.ASC:
        return <i onClick={sort} className="column-sort column-sort-asc icon-up-open" />;
      case SortDirection.DESC:
        return <i onClick={sort} className="column-sort column-sort-desc icon-down-open" />;
      default: // no sort
        return <i onClick={sort} className="column-sort column-sort-none icon-down-open" />;
      }
    };

    return <Translation>{t => 
      <th title={t(columnSpec.nameKey)}> {/* in case the name got truncated */}
        <div className="header-container">
          <span className="header-name">{t(columnSpec.nameKey)}</span>
          {sortable && sortButton()}
        </div>
      </th>
    }</Translation>;
  }
}

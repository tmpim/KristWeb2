import React, { ReactNode, Component } from "react";

import { Translation } from "react-i18next";

import { HeaderSpec, SortDirection } from "./ListView";

import "./ColumnHeader.scss";

interface Props<T> {
  headerKey: Extract<keyof T, string>;
  headerSpec: HeaderSpec;

  sortDirection?: SortDirection;

  onSort: (headerKey?: Extract<keyof T, string>, direction?: SortDirection) => void;
}

export class ColumnHeader<T> extends Component<Props<T>> {
  onClickSort(): void {
    const { headerKey, sortDirection: oldDirection, onSort } = this.props;
    
    if (oldDirection === undefined) // NONE -> ASC
      onSort(headerKey, SortDirection.ASC);
    else if (oldDirection === SortDirection.ASC) // ASC -> DESC
      onSort(headerKey, SortDirection.DESC);
    else if (oldDirection === SortDirection.DESC) // DESC -> NONE
      onSort(undefined, undefined);
  }

  render(): ReactNode {
    const { headerSpec, sortDirection } = this.props;
    
    // If 'sortable' is undefined, then assume it is sortable
    const sortable = headerSpec.sortable === undefined ? true : headerSpec.sortable;

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

    return <th>
      <Translation>{t => t(headerSpec.nameKey)}</Translation>
      {sortable && sortButton()}
    </th>;
  }
}

import React, { Component, ReactNode } from "react";

import { Columns } from "./DataProvider";

interface Props<T> {
  columns: Columns<T>;
  data: T;
}

export class ListTableRow<T> extends Component<Props<T>> {
  render(): ReactNode {
    const { columns, data } = this.props;

    // Create the row
    return <tr>
      {/* Render each cell */}
      {Array.from(columns, ([columnKey, columnSpec]) => {
        // If 'nowrap' is undefined, then assume it is nowrap
        const nowrap = columnSpec.nowrap === undefined || columnSpec.nowrap;

        // Format the value if the columnSpec has a formatter
        const value = columnSpec.formatValue
          ? columnSpec.formatValue(columnKey, data)
          : data[columnKey];

        return <td key={columnKey} className={nowrap ? "text-nowrap" : ""}>
          {value}
        </td>;
      })}
    </tr>;
  }
}

import React, { Component, ReactNode } from "react";
import { HeaderSpec, SortDirection } from ".";

import Table from "react-bootstrap/Table";

import { ColumnHeader } from "./ColumnHeader";
import { KristValue } from "@components/krist-value";

import "./ListTable.scss";

interface State<T> {
  orderBy?: Extract<keyof T, string>;
  order?: SortDirection;
}

interface Props<T> {
  headers?: Map<Extract<keyof T, string>, HeaderSpec>;
}

export class ListTable<T> extends Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);

    this.state = {
      orderBy: undefined,
      order: undefined
    };
  }

  setSort(orderBy?: Extract<keyof T, string>, order?: SortDirection): void {
    this.setState({
      orderBy, order
    });
  }

  render(): ReactNode {
    const { headers } = this.props;
    const { orderBy, order } = this.state;

    return <Table borderless hover>
      {/* Table headers, defined by the header map in the props */}
      {headers && <thead>
        <tr>
          {Array.from(headers, ([headerKey, headerSpec]) => 
            (<ColumnHeader 
              key={headerKey} 
              headerKey={headerKey} 
              headerSpec={headerSpec}
              sortDirection={orderBy === headerKey ? order : undefined} 
              onSort={this.setSort.bind(this)}
            />))}
        </tr>
      </thead>}

      {/* Table rows */}
      <tbody>
        <tr>
          <td>Shop Wallet</td>
          <td>kreichdyes</td>
          <td><KristValue value={15364} /></td>
          <td>12</td>
          <td>Shops</td>
          <td>2020/09/11 08:08</td>
        </tr>

        <tr>
          <td>Main Wallet</td>
          <td>khugepoopy</td>
          <td><KristValue value={1024} /></td>
          <td>3</td>
          <td></td>
          <td>2016/02/14 00:00</td>
        </tr>

        <tr>
          <td>Old Wallet</td>
          <td>kre3w0i79j</td>
          <td><KristValue value={0} /></td>
          <td>0</td>
          <td></td>
          <td>2015/02/14 00:00</td>
        </tr>
      </tbody>
    </Table>;
  }
}

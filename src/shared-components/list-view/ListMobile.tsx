import { KristValue } from "@components/krist-value/KristValue";
import React, { Component, ReactNode } from "react";

import { ListGroup } from "react-bootstrap";

import { Columns, QueryStateBase, DataStateBase } from "./DataProvider";

import "./ListMobile.scss";

export type MobileItemRenderer<T> = (item: T) => ReactNode;

interface Props<T> extends QueryStateBase<T>, DataStateBase<T> {
  renderListItem: MobileItemRenderer<T>;
}

export class ListMobile<T> extends Component<Props<T>> {
  render(): ReactNode {
    const { renderListItem, loading, data } = this.props;

    // Render skeleton items if the data is loading
    if (loading || !data) return "loading"; /* TODO */

    // TODO: handle potential edge case where loading = false, data = truthy
    // TODO: handle errors

    // Otherwise, render the data
    return <ListGroup variant="flush">
      {data.map((item, i) => 
        <ListGroup.Item key={i}>
          {renderListItem(item)}  
        </ListGroup.Item>)}
    </ListGroup>
  }
}

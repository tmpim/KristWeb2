import React, { Component, ReactNode } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { Columns, ColumnKey, SortDirection, DataProvider, QueryStateBase, DataStateBase } from "./DataProvider";
import { ListPagination } from "./ListPagination";
import { ListTable } from "./ListTable";

import "./ListView.scss";

interface Props<T> {
  title?: string;
  actions?: ReactNode;
  filters?: ReactNode;

  page?: number;
  pages?: number;

  columns: Columns<T>;

  dataProvider: DataProvider<T>;
}

interface State<T> extends QueryStateBase<T>, DataStateBase<T> {}

export class ListView<T> extends Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);

    this.state = {
      loading: true
    };
  }

  componentDidMount(): void {
    this.loadData();
  }

  // Assign the new sort orderBy key and direction to the state and refresh the
  // data immediately.
  setSort(orderBy?: ColumnKey<T>, order?: SortDirection): void {
    this.setState({
      orderBy, order,
      loading: true // Reload the data
    }, () => this.loadData());
  }

  /** Refresh the data with the latest query parameters */
  async loadData(): Promise<void> {
    const data = await this.props.dataProvider(this.state);

    this.setState({
      loading: false,
      total: data.total,
      data: data.data
    });
  }

  render(): ReactNode {
    const { 
      title, actions, filters, 
      page, pages, 
      columns
    } = this.props;

    return <Container fluid className="py-4 list-view">
      {/* Main header row - wallet count and action buttons */}
      <Row className="mb-2">
        <Col className="d-flex align-items-center">
          {/* List title */}
          {title && <h3 className="flex-fill mb-0">{title}</h3>}

          {/* Optional action button row */}
          {actions && <div className="list-view-actions">{actions}</div>}
        </Col>
      </Row>

      {/* Search, filter and pagination row */}
      <Row className="mb-2">
        {/* List filters (e.g. search, category dropdown) */}
        {filters && 
          <Col className="list-view-filters">
            {filters}
          </Col>}

        {/* Pagination */}
        {page && pages && 
          <Col className="flex-grow-0">
            <ListPagination defaultPage={page} pages={pages} />
          </Col>}
      </Row>

      {/* Main table */}
      <ListTable 
        columns={columns}

        orderBy={this.state.orderBy}
        order={this.state.order}

        loading={this.state.loading}
        data={this.state.data}

        setSort={this.setSort.bind(this)}
      />
    </Container>;
  }
}

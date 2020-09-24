import React, { Component, ReactNode } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { Columns, ColumnKey, SortDirection, DataProvider, QueryStateBase, DataStateBase } from "./DataProvider";
import { ListPagination } from "./ListPagination";
import { ListTable } from "./ListTable";
import { ListMobile, MobileItemRenderer } from "./ListMobile";

import "./ListView.scss";

export const MOBILE_BREAKPOINT = 768;

interface Props<T> {
  title?: string;
  actions?: ReactNode;
  filters?: ReactNode;

  page?: number;
  pages?: number;

  columns: Columns<T>;

  dataProvider: DataProvider<T>;

  renderMobileItem: MobileItemRenderer<T>;
}

interface State<T> extends QueryStateBase<T>, DataStateBase<T> {
  isMobile: boolean;
}

export class ListView<T> extends Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);

    this.state = {
      loading: true,
      isMobile: false
    };
  }

  // Arrow function to implicitly bind 'this'
  checkDimensions = (): void => {
    this.setState({
      isMobile: window.innerWidth < MOBILE_BREAKPOINT
    });
  }

  componentDidMount(): void {
    window.addEventListener("resize", this.checkDimensions);
    this.checkDimensions();

    this.loadData();
  }

  componentWillUnmount(): void {
    window.addEventListener("resize", this.checkDimensions);
  }

  /** Assign the new sort orderBy key and direction to the state and refresh the
   * data immediately. */
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

  /** Render data based on whether or not this is on mobile */
  renderData(): ReactNode {
    const { columns, renderMobileItem } = this.props;
    const { isMobile } = this.state;

    if (isMobile) { // Mobile, show a list
      return <ListMobile
        {...this.state} // Apply the order, loading and data state props
        renderListItem={renderMobileItem}
      />;
    } else { // Not mobile, show a table
      return <ListTable 
        columns={columns}
        {...this.state} // Apply the order, loading and data state props
        setSort={this.setSort.bind(this)}
      />;
    }
  }

  render(): ReactNode {
    const { 
      title, actions, filters, 
      page, pages
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

      {/* Render the data: list on mobile, table on desktop */}
      {this.renderData()}
    </Container>;
  }
}

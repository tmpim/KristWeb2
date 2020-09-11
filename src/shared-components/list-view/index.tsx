import React, { ReactNode } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

interface Props {
  title?: string;
  actions?: ReactNode;
  filters?: ReactNode;
};

export const ListView: React.FC<Props> = (props: Props) => {
  return <Container fluid className="py-4">
    {/* Main header row - wallet count and action buttons */}
    <Row className="mb-2">
      <Col className="d-flex align-items-center">
        {/* List title */}
        {props.title && <h3 className="flex-fill mb-0">{props.title}</h3>}

        {/* Optional action button row */}
        {props.actions}
      </Col>
    </Row>

    {/* Search, filter and pagination row */}
    <Row className="mb-2">
      {/* List filters (e.g. search, category dropdown) */}
      {props.filters}

      {/* Pagination */}
    </Row>
  </Container>;
};

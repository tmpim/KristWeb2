import React from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import MainNav from "./components/nav";
import MainSidebar from "./components/sidebar";

export default function() {
  return (
    <>
      <MainNav />
      <MainSidebar />
      <Container fluid>
        <Row>
        </Row>
      </Container>
    </>
  );
}
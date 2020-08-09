import React from "react";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import MainNav from "./components/nav";
import MainSidebar from "./components/sidebar";

export default function() {
  return (
    <Router>
      <MainNav />
      <MainSidebar />
      <Container fluid>
        <Row>
        </Row>
      </Container>
    </Router>
  );
}
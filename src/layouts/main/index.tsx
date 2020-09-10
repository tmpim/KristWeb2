import React from "react";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { MainNav } from "./components/nav";
import { MainSidebar } from "./components/sidebar";

import { Credits } from "@layouts/credits";

import "./index.scss";

export const MainLayout: React.FC = () => (
  <Router>
    <MainNav />
    <Container fluid id="main-container">
      <Row>
        <MainSidebar />
        <Col id="page-container">
          <Switch>
            <Route exact path="/">
              {/* Home */}
            </Route>
            <Route path="/credits">
              <Credits />
            </Route>
          </Switch>        
        </Col>
      </Row>
    </Container>
  </Router>
);

import React from "react";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { WalletManager } from "@app/WalletManager";

import { MainNav } from "./components/nav";
import { MainSidebar } from "./components/sidebar";

import { Credits } from "@layouts/credits";

import "./index.scss";

interface Props {
  walletManager: WalletManager;
}

export const MainLayout: React.FC<Props> = (props: Props): JSX.Element => (
  <Router>
    <MainNav />
    <Container fluid id="main-container">
      <Row>
        <MainSidebar walletManager={props.walletManager} />
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

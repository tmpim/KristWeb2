import React, { Component, ReactNode } from "react";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { MainNav } from "./components/nav/MainNav";
import { MainSidebar } from "./components/sidebar/MainSidebar";

import { MyWalletsPage } from "@layouts/my-wallets/MyWalletsPage";
import { CreditsPage } from "@layouts/credits/CreditsPage";

import "./MainLayout.scss";

interface State {
  sidebarCollapsed: boolean;
}

export class MainLayout extends Component<unknown, State> {
  constructor(props: unknown) {
    super(props);

    this.state = { 
      sidebarCollapsed: true // Collapse by default on mobile
    };
  }

  toggleSidebar(): void {
    this.setState({
      sidebarCollapsed: !this.state.sidebarCollapsed
    });
  }

  render(): ReactNode {
    const { sidebarCollapsed } = this.state;

    return (
      <Router>
        {/* Top nav bar */}
        <MainNav toggleSidebar={this.toggleSidebar.bind(this)} />

        {/* Main container */}
        <Container fluid id="main-container">
          <Row>
            {/* Left sidebar */}
            <MainSidebar 
              isCollapsed={sidebarCollapsed} 
              toggleSidebar={this.toggleSidebar.bind(this)}
            />

            {/* Page container */}
            <Col id="page-container">
              <Switch>
                <Route exact path="/">
                  {/* Home */}
                </Route>
                <Route exact path="/wallets">
                  <MyWalletsPage />
                </Route>
                <Route path="/credits">
                  <CreditsPage />
                </Route>
              </Switch>        
            </Col>
          </Row>
        </Container>
      </Router>
    );
  }
}

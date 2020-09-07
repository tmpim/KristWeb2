import React from "react";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";

import { Brand } from "./Brand";
import { Search } from "./Search";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { SettingsCog } from "./SettingsCog";

import "./index.scss";

interface Props {
  isGuest: boolean;
}

export const MainNav: React.FC<Props> = ({ isGuest }: Props): JSX.Element => (
  <Navbar bg="dark" variant="dark" fixed="top" id="main-nav">
    <Brand />
    <Navbar.Toggle aria-controls="main-nav-collapse" />
    <Navbar.Collapse id="main-nav-collapse">
      {/* Main nav buttons, only show if logged in */}
      {!isGuest && <Nav>
        {/* Send Krist button */}
        <LinkContainer to="/send">
          <Nav.Link><span className="nav-icon icon-paper-plane"></span>Send</Nav.Link>
        </LinkContainer>

        {/* Receive Krist button */}
        <LinkContainer to="/request">
          <Nav.Link><span className="nav-icon icon-download"></span>Request</Nav.Link>
        </LinkContainer>
      </Nav>}
      <Search />
      <ConnectionIndicator />
      <SettingsCog />
    </Navbar.Collapse>
  </Navbar>
);

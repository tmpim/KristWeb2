import React from "react";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";

import { Brand } from "./Brand";
import { Search } from "./Search";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { SettingsCog } from "./SettingsCog";

import "./index.scss";

export const MainNav = (): JSX.Element => (
  <Navbar bg="dark" variant="dark" fixed="top" id="main-nav">
    <Brand />
    <Navbar.Toggle aria-controls="main-nav-collapse" />
    <Navbar.Collapse id="main-nav-collapse">
      <Nav>
        <Nav.Link href="/send"><span className="nav-icon icon-paper-plane"></span>Send</Nav.Link>
        <Nav.Link href="/request"><span className="nav-icon icon-download"></span>Request</Nav.Link>
      </Nav>
      <Search />
      <ConnectionIndicator />
      <SettingsCog />
    </Navbar.Collapse>
  </Navbar>
);

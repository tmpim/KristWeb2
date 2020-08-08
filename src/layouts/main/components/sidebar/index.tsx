import React from "react";

import "./index.scss";

import Nav from "react-bootstrap/Nav";
import { TotalBalance } from "./TotalBalance";
import Footer from "./Footer";

export default function() {
  return (
    <Nav id="main-sidebar">
      <TotalBalance balance={250000} /> 

      <div className="sidebar-content">
        <Nav.Item>
          <Nav.Link href="/">Dashboard</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/wallets">My Wallets</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/friends">Address Book</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/me/transactions">Transactions</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/me/names">Names</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/mining">Mining</Nav.Link>
        </Nav.Item>

        <h6>Network</h6>
        <Nav.Item>
          <Nav.Link href="/network/blocks">Blocks</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/network/transactions">Transactions</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link href="/network/names">Names</Nav.Link>
        </Nav.Item>        
      </div>

      <Footer />
    </Nav>
  )
};
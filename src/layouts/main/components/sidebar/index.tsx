import React from "react";

import Nav from "react-bootstrap/Nav";

import { WalletManager } from "@app/WalletManager";

import { TotalBalance } from "./TotalBalance";
import { SidebarItem } from "./SidebarItem";
import { Footer } from "./Footer";

import "./index.scss";

interface Props {
  walletManager: WalletManager;
}

export const MainSidebar: React.FC<Props> = (props: Props): JSX.Element => (
  <Nav id="main-sidebar">
    {!props.walletManager.isGuest && <TotalBalance balance={250000} />}

    <div className="sidebar-content">
      <SidebarItem url="/" icon="home" text="Dashboard" />
      <SidebarItem url="/wallets" icon="wallet" text="My Wallets" />
      <SidebarItem url="/friends" icon="users" text="Address Book" />
      <SidebarItem url="/me/transactions" icon="bank" text="Transactions" />
      <SidebarItem url="/me/names" icon="tags" text="Names" />
      <SidebarItem url="/mining" icon="diamond" text="Mining" />

      <h6>Network</h6>
      <SidebarItem url="/network/blocks" icon="cubes" text="Blocks" />
      <SidebarItem url="/network/transactions" icon="bank" text="Transactions" />
      <SidebarItem url="/network/names" icon="tags" text="Names" />
      <SidebarItem url="/network/statistics" icon="chart-line" text="Statistics" />
    </div>

    <Footer />
  </Nav>
);

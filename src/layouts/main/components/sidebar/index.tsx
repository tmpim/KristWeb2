import React from "react";

import Nav from "react-bootstrap/Nav";

import { GuestIndicator } from "./GuestIndicator";
import { TotalBalance } from "./TotalBalance";
import { SidebarItem } from "./SidebarItem";
import { Footer } from "./Footer";

import { connect } from "react-redux";
import { RootState } from "@store";

import "./index.scss";

interface Props {
  isGuest: boolean;
}

const mapStateToProps = (state: RootState): Props => ({
  isGuest: state.walletManager.isGuest
});

const MainSidebarComponent: React.FC<Props> = ({ isGuest }: Props): JSX.Element => (
  <Nav id="main-sidebar">
    {/* Show the guest indicator if they are browsing as guest, otherwise 
        show their total balance. */}
    {isGuest
      ? <GuestIndicator />
      : <TotalBalance balance={250000} />}

    <div className="sidebar-content">
      <SidebarItem url="/" icon="home" text="Dashboard" />

      {/* Hide irrelevant entries for guests. */}
      {!isGuest && <>
        <SidebarItem url="/wallets" icon="wallet" text="My Wallets" />
        <SidebarItem url="/friends" icon="users" text="Address Book" />      
      </>}
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

export const MainSidebar = connect(mapStateToProps)(MainSidebarComponent);

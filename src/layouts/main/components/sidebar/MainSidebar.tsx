import React from "react";

import { useTranslation } from "react-i18next";

import Nav from "react-bootstrap/Nav";

import { GuestIndicator } from "./GuestIndicator";
import { TotalBalance } from "./TotalBalance";
import { SidebarItem } from "./SidebarItem";
import { Footer } from "./Footer";

import { connect } from "react-redux";
import { RootState } from "@store";

import "./MainSidebar.scss";

interface OwnProps {
  isCollapsed: boolean;
}

interface StateProps {
  isGuest: boolean;
}

const mapStateToProps = (state: RootState): StateProps => ({
  isGuest: state.walletManager.isGuest
});

type Props = StateProps & OwnProps;

const MainSidebarComponent: React.FC<Props> = ({ isGuest, isCollapsed }: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <div id="main-sidebar-container" className={isCollapsed ? "closed" : ""}>
        <Nav id="main-sidebar">
          {/* Show the guest indicator if they are browsing as guest, otherwise 
              show their total balance. */}
          {isGuest
            ? <GuestIndicator />
            : <TotalBalance balance={250000} />}

          <div className="sidebar-content">
            <SidebarItem url="/" icon="home" textKey="dashboard" />

            {/* Hide irrelevant entries for guests. */}
            {!isGuest && <>
              <SidebarItem url="/wallets" icon="wallet" textKey="myWallets" />
              <SidebarItem url="/friends" icon="users" textKey="addressBook" />      
            </>}
            <SidebarItem url="/me/transactions" icon="bank" textKey="transactions" />
            <SidebarItem url="/me/names" icon="tags" textKey="names" />
            <SidebarItem url="/mining" icon="diamond" textKey="mining" />
            
            <h6>{t("sidebar.network")}</h6>
            <SidebarItem url="/network/blocks" icon="cubes" textKey="blocks" />
            <SidebarItem url="/network/transactions" icon="bank" textKey="transactions" />
            <SidebarItem url="/network/names" icon="tags" textKey="names" />
            <SidebarItem url="/network/statistics" icon="chart-line" textKey="statistics" />
          </div>

          <Footer />
        </Nav>
      </div>

      {/* Fade the rest of the app out on mobile when the sidebar is open */}
      <div id="main-sidebar-backdrop" className={isCollapsed ? "" : "show"} />
    </>
  );
};

export const MainSidebar = connect(mapStateToProps)(MainSidebarComponent);

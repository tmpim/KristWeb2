// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState } from "react";
import { Layout, Grid } from "antd";

import { AppHeader } from "./nav/AppHeader";
import { Sidebar } from "./sidebar/Sidebar";
import { AppRouter } from "../global/AppRouter";

import "./AppLayout.less";

const { useBreakpoint } = Grid;

export function AppLayout(): JSX.Element {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const bps = useBreakpoint();

  return <Layout data-testid="site-app-layout">
    <AppHeader sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />

    <Layout>
      <Sidebar collapsed={!bps.md && sidebarCollapsed} />

      {/* Fade out the background when the sidebar is open on mobile */}
      {!bps.md && <div
        className={"site-sidebar-backdrop " + (sidebarCollapsed ? "collapsed" : "")}
        onClick={() => setSidebarCollapsed(true)}
      />}

      <Layout className={"site-layout " + (!bps.md ? "site-layout-mobile" : "")}>
        <AppRouter />
      </Layout>
    </Layout>
  </Layout>;
}

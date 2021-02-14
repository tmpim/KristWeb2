import React, { useState } from "react";
import { Layout, Menu, Grid, AutoComplete, Input } from "antd";
import { SendOutlined, DownloadOutlined, MenuOutlined, SettingOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Brand } from "./Brand";
import { Sidebar } from "./sidebar/Sidebar";
import { AppRouter } from "./AppRouter";

import "./AppLayout.less";

const { useBreakpoint } = Grid;

export function AppLayout(): JSX.Element {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const bps = useBreakpoint();

  return <Layout>
    <Layout.Header className="site-header">
      {/* Sidebar toggle for mobile */}
      {!bps.md && (
        <Menu theme="dark" mode="horizontal" selectable={false} forceSubMenuRender={true} className="site-header-sidebar-toggle">
          <Menu.Item key="1" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <MenuOutlined />
          </Menu.Item>
        </Menu>
      )}

      {/* Logo */}
      {bps.md && <Brand />}

      {/* Send and receive buttons */}
      {bps.md && <Menu theme="dark" mode="horizontal" selectable={false} forceSubMenuRender={true} className="site-header-nav">
        <Menu.Item key="1" icon={<SendOutlined />}>{t("nav.send")}</Menu.Item>
        <Menu.Item key="2" icon={<DownloadOutlined />}>{t("nav.request")}</Menu.Item>
      </Menu>}

      {/* Spacer to push search box to the right */}
      {bps.md && <div className="site-header-spacer" />}

      {/* Search box */}
      <div className="site-header-search-container">
        <AutoComplete className="site-header-search">
          <Input.Search placeholder={t("nav.search")} />
        </AutoComplete>
      </div>

      {/* Settings button */}
      <Menu theme="dark" mode="horizontal" selectable={false} forceSubMenuRender={true} className="site-header-settings">
        <Menu.Item key="1" icon={<SettingOutlined />} title={t("nav.settings")}>
          <Link to="/settings"></Link>
        </Menu.Item>
      </Menu>
    </Layout.Header>

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

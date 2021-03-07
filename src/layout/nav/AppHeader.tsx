// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Layout, Menu, Grid } from "antd";
import { SendOutlined, DownloadOutlined, MenuOutlined, SettingOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Brand } from "./Brand";
import { Search } from "./Search";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { CymbalIndicator } from "./CymbalIndicator";

import { ConditionalLink } from "@comp/ConditionalLink";

const { useBreakpoint } = Grid;

interface Props {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AppHeader({ sidebarCollapsed, setSidebarCollapsed }: Props): JSX.Element {
  const { t } = useTranslation();
  const bps = useBreakpoint();

  return <Layout.Header className="site-header">
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
      <Menu.Item key="1" className="nyi" icon={<SendOutlined />}>{t("nav.send")}</Menu.Item>
      <Menu.Item key="2" className="nyi" icon={<DownloadOutlined />}>{t("nav.request")}</Menu.Item>
    </Menu>}

    {/* Spacer to push search box to the right */}
    {bps.md && <div className="site-header-spacer" />}

    {/* Search box */}
    <Search />

    {/* Connection indicator */}
    <ConnectionIndicator />

    {/* Cymbal indicator */}
    <CymbalIndicator />

    {/* Settings button */}
    <Menu theme="dark" mode="horizontal" selectable={false} forceSubMenuRender={true} className="site-header-settings">
      <Menu.Item key="1" icon={<SettingOutlined />} title={t("nav.settings")}>
        <ConditionalLink to="/settings" matchTo aria-label={t("nav.settings")}></ConditionalLink>
      </Menu.Item>
    </Menu>
  </Layout.Header>;
}

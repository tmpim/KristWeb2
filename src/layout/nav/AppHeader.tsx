// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Layout, Menu, Grid } from "antd";
import { SendOutlined, DownloadOutlined, MenuOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { Brand } from "./Brand";
import { Search } from "./Search";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { CymbalIndicator } from "./CymbalIndicator";
import { TopMenu } from "./TopMenu";

import { ConditionalLink } from "@comp/ConditionalLink";

import "./AppHeader.less";

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

    {/* Send and request buttons */}
    {bps.md && <Menu theme="dark" mode="horizontal" selectable={false} forceSubMenuRender={true} className="site-header-nav">
      {/* Send Krist */}
      <Menu.Item key="1" icon={<SendOutlined />}>
        <ConditionalLink to="/send" matchTo aria-label={t("nav.send")}>
          {t("nav.send")}
        </ConditionalLink>
      </Menu.Item>

      {/* Request Krist */}
      <Menu.Item key="2" className="nyi" icon={<DownloadOutlined />}>
        <ConditionalLink to="/request" matchTo aria-label={t("nav.request")}>
          {t("nav.request")}
        </ConditionalLink>
      </Menu.Item>
    </Menu>}

    {/* Spacer to push search box to the right */}
    {bps.md && <div className="site-header-spacer" />}

    {/* Search box */}
    <Search />

    {/* Connection indicator */}
    <ConnectionIndicator />

    {/* Cymbal indicator */}
    <CymbalIndicator />

    {/* Settings button, or dropdown on mobile if there are other options */}
    <TopMenu />
  </Layout.Header>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect } from "react";
import { Layout, Menu, MenuItemProps } from "antd";
import { HomeOutlined, WalletOutlined, TeamOutlined, BankOutlined, TagsOutlined, SketchOutlined, BuildOutlined, StockOutlined } from "@ant-design/icons";

import { TFunction, useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { ServiceWorkerCheck } from "./ServiceWorkerCheck";
import { SidebarTotalBalance } from "./SidebarTotalBalance";
import { SidebarFooter } from "./SidebarFooter";

const { Sider } = Layout;

type SidebarItemProps = MenuItemProps & {
  to: string;
  icon: React.ReactNode;
  name: string;

  nyi?: boolean;

  group?: "network";
}
const sidebarItems: SidebarItemProps[] = [
  { icon: <HomeOutlined />,   name: "dashboard",    to: "/" },
  { icon: <WalletOutlined />, name: "myWallets",    to: "/wallets" },
  { icon: <TeamOutlined />,   name: "addressBook",  to: "/friends",         nyi: true },
  { icon: <BankOutlined />,   name: "transactions", to: "/me/transactions" },
  { icon: <TagsOutlined />,   name: "names",        to: "/me/names" },
  { icon: <SketchOutlined />, name: "mining",       to: "/mining",          nyi: true },

  { group: "network", icon: <BuildOutlined />, name: "blocks",       to: "/network/blocks",       nyi: true },
  { group: "network", icon: <BankOutlined />,  name: "transactions", to: "/network/transactions" },
  { group: "network", icon: <TagsOutlined />,  name: "names",        to: "/network/names" },
  { group: "network", icon: <StockOutlined />, name: "statistics",   to: "/network/statistics",   nyi: true },
];

function getSidebarItems(t: TFunction<string>, group?: string) {
  return sidebarItems
    .filter(i => i.group === group)
    .map(i => (
      <Menu.Item key={i.to} icon={i.icon} className={i.nyi ? "nyi" : ""}>
        <Link to={i.to}>{t("sidebar." + i.name)}</Link>
      </Menu.Item>
    ));
}

export function Sidebar({ collapsed }: { collapsed: boolean }): JSX.Element {
  const { t } = useTranslation();

  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState<string | undefined>();

  useEffect(() => {
    setSelectedKey(sidebarItems.find(i => i.to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(i.to))?.to);
  }, [location]);

  return <Sider
    width={240}
    className={"site-sidebar " + (collapsed ? "collapsed" : "")}
  >
    {/* Service worker update checker, which may appear at the top of the
      * sidebar if an update is available. */}
    <ServiceWorkerCheck />

    {/* Total balance */}
    <SidebarTotalBalance />

    {/* Menu items */}
    <Menu theme="dark" mode="inline" selectedKeys={selectedKey ? [selectedKey] : undefined}>
      {getSidebarItems(t)}

      <Menu.ItemGroup key="g1" title={t("sidebar.network")}>
        {getSidebarItems(t, "network")}
      </Menu.ItemGroup>
    </Menu>

    {/* Credits footer */}
    <SidebarFooter />
  </Sider>;
}

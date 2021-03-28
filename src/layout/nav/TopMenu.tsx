// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useCallback, useMemo, useContext, createContext, FC, ReactNode } from "react";
import { Menu, Dropdown } from "antd";
import {
  MoreOutlined, SettingOutlined, SendOutlined, DownloadOutlined,
  SortAscendingOutlined
} from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { ConditionalLink } from "@comp/ConditionalLink";
import { useBreakpoint } from "@utils/hooks";

import { OpenSortModalFn, SetOpenSortModalFn } from "@utils/table/SortModal";

import Debug from "debug";
const debug = Debug("kristweb:top-menu");

export type Opts = React.ReactNode | undefined;
export type SetMenuOptsFn = (opts: Opts) => void;

interface TopMenuCtxRes {
  options?: ReactNode;
  setMenuOptions?: SetMenuOptsFn;

  openSortModalFn?: OpenSortModalFn;
  setOpenSortModal?: SetOpenSortModalFn;
}

export const TopMenuContext = createContext<TopMenuCtxRes>({});

export function TopMenu(): JSX.Element {
  const { tStr } = useTFns("nav.");
  const bps = useBreakpoint();

  const ctxRes = useContext(TopMenuContext);
  const options = ctxRes?.options;
  const openSortModalFn = ctxRes?.openSortModalFn;

  const menu = useMemo(() => (
    <Dropdown
      trigger={["click"]}
      overlayClassName="site-header-top-dropdown-menu"
      overlay={<Menu>
        {/* Send Krist */}
        <Menu.Item>
          <ConditionalLink to="/send" matchTo aria-label={tStr("sendLong")}>
            <div><SendOutlined />{tStr("sendLong")}</div>
          </ConditionalLink>
        </Menu.Item>

        {/* Request Krist */}
        <Menu.Item>
          <ConditionalLink to="/request" matchTo aria-label={tStr("requestLong")}>
            <div><DownloadOutlined />{tStr("requestLong")}</div>
          </ConditionalLink>
        </Menu.Item>

        {/* Only show the extra divider if there are options */}
        {options && <Menu.Divider />}

        {/* Page-specified options */}
        {options}

        {/* If the page is a bulk listing on mobile, show a button to adjust
          * the sort order. */}
        {openSortModalFn?.[0] && <>
          <Menu.Divider />

          <Menu.Item onClick={openSortModalFn[0]}>
            <SortAscendingOutlined />{tStr("sort")}
          </Menu.Item>
        </>}

        <Menu.Divider />

        {/* Settings item */}
        <Menu.Item>
          <ConditionalLink to="/settings" matchTo aria-label={tStr("settings")}>
            <div><SettingOutlined />{tStr("settings")}</div>
          </ConditionalLink>
        </Menu.Item>
      </Menu>}
    >
      <MoreOutlined />
    </Dropdown>
  ), [tStr, options, openSortModalFn]);

  // If on mobile and there are options available from the page, display them
  // instead of the settings button.
  const btn = useMemo(() => (
    // Menu or settings button in the header
    <Menu
      theme="dark" mode="horizontal"
      selectable={false} forceSubMenuRender={true}
      className="site-header-settings"
    >
      {!bps.md
        ? (
          // Menu button for mobile
          <Menu.Item key="1" title={tStr("more")}>
            {menu}
          </Menu.Item>
        )
        : (
          // Regular settings button
          <Menu.Item key="1" icon={<SettingOutlined />} title={tStr("settings")}>
            <ConditionalLink to="/settings" matchTo aria-label={tStr("settings")} />
          </Menu.Item>
        )}
    </Menu>
  ), [tStr, bps, menu]);

  return btn;
}

export const TopMenuProvider: FC = ({ children }) => {
  const [menuOptions, setMenuOptions] = useState<ReactNode>();
  const [openSortModalFn, setOpenSortModal] = useState<OpenSortModalFn>();

  const res: TopMenuCtxRes = useMemo(() => ({
    options: menuOptions, setMenuOptions,
    openSortModalFn, setOpenSortModal
  }), [menuOptions, openSortModalFn]);

  return <TopMenuContext.Provider value={res}>
    {children}
  </TopMenuContext.Provider>;
};

export type TopMenuOptionsHookRes = [
  boolean, // isMobile
  SetMenuOptsFn, // set
  () => void, // unset
  SetOpenSortModalFn | undefined
]

export function useTopMenuOptions(): TopMenuOptionsHookRes {
  const bps = useBreakpoint();
  const { setMenuOptions, setOpenSortModal } = useContext(TopMenuContext);

  const set = useCallback((opts: Opts) => {
    debug("top menu options hook set");
    setMenuOptions?.(opts);
  }, [setMenuOptions]);

  const unset = useCallback(() => {
    debug("top menu options hook destructor");
    setMenuOptions?.(undefined);
    setOpenSortModal?.(undefined);
  }, [setMenuOptions, setOpenSortModal]);

  // Return whether or not the options are being shown
  return [!bps.md, set, unset, setOpenSortModal];
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useCallback, useMemo, useContext, createContext, FC, ReactNode } from "react";
import { Menu, Grid, Dropdown } from "antd";
import { MoreOutlined, SettingOutlined } from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { ConditionalLink } from "@comp/ConditionalLink";

import Debug from "debug";
const debug = Debug("kristweb:top-menu");

export type Opts = React.ReactNode | undefined;
export type SetMenuOptsFn = (opts: Opts) => void;

interface TopMenuCtxRes {
  options?: ReactNode;
  setMenuOptions?: SetMenuOptsFn;
}

export const TopMenuContext = createContext<TopMenuCtxRes>({});

export function TopMenu(): JSX.Element {
  const { tStr } = useTFns("nav.");
  const bps = Grid.useBreakpoint();

  const ctxRes = useContext(TopMenuContext);
  const options = ctxRes?.options;

  const menu = useMemo(() => (
    <Dropdown
      trigger={["click"]}
      overlayClassName="site-header-top-dropdown-menu"
      overlay={<Menu>
        {options}

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
  ), [tStr, options]);

  // If on mobile and there are options available from the page, display them
  // instead of the settings button.
  const btn = useMemo(() => (
    // Menu or settings button in the header
    <Menu
      theme="dark" mode="horizontal"
      selectable={false} forceSubMenuRender={true}
      className="site-header-settings"
    >
      {!bps.md && options
        ? (
          // Menu button, if there are options available
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
  ), [tStr, bps, options, menu]);

  return btn;
}

export const TopMenuProvider: FC = ({ children }) => {
  const [menuOptions, setMenuOptions] = useState<ReactNode>();
  const res: TopMenuCtxRes = useMemo(() => ({
    options: menuOptions, setMenuOptions
  }), [menuOptions, setMenuOptions]);

  return <TopMenuContext.Provider value={res}>
    {children}
  </TopMenuContext.Provider>;
};

export function useTopMenuOptions(): [boolean, SetMenuOptsFn, () => void] {
  const bps = Grid.useBreakpoint();
  const { setMenuOptions } = useContext(TopMenuContext);

  const set = useCallback((opts: Opts) => {
    debug("top menu options hook set");
    setMenuOptions?.(opts);
  }, [setMenuOptions]);

  const unset = useCallback(() => {
    debug("top menu options hook destructor");
    setMenuOptions?.(undefined);
  }, [setMenuOptions]);

  // Return whether or not the options are being shown
  return [!bps.md, set, unset];
}

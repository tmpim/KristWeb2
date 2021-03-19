// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Menu } from "antd";

import { useTFns } from "@utils/i18n";

import { SettingName } from "@utils/settings";
import { SettingBoolean } from "./SettingBoolean";
import { SettingInteger } from "./SettingInteger";

export interface SettingDesc<T> {
  component: React.ComponentType<{
    setting: SettingName<T>;
    title?: string;
    titleKey?: string;
    description?: string;
    descriptionKey?: string;
  }>;

  setting: SettingName<T>;
}

interface Props {
  subKey: string;
  icon?: React.ReactNode;

  settings: SettingDesc<any>[];
}

export const booleanSetting = (setting: SettingName<boolean>): SettingDesc<boolean> =>
  ({ component: SettingBoolean, setting });
export const integerSetting = (setting: SettingName<number>): SettingDesc<number> =>
  ({ component: SettingInteger, setting });

export function SettingsGroup({
  subKey,
  icon,

  settings,

  ...props
}: Props): JSX.Element {
  const { tStr, tKey, i18n } = useTFns("settings.");

  return <Menu.SubMenu
    key={"sub-" + subKey}
    icon={icon}
    title={tStr("subMenu" + subKey)}
    {...props}
  >
    {/* Render each setting */}
    {settings.map(s => (
      <Menu.Item key={`${subKey}/${s.setting}`}>
        {React.createElement(s.component, {
          setting: s.setting,
          titleKey: tKey(s.setting),
          descriptionKey: i18n.exists(tKey(s.setting + "Description"))
            ? tKey(s.setting + "Description")
            : undefined
        })}
      </Menu.Item>
    ))}
  </Menu.SubMenu>;
}

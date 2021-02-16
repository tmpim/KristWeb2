import React from "react";
import { Switch } from "antd";

import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";

import { SettingName, setBooleanSetting } from "../../utils/settings";

interface Props {
  setting: SettingName<boolean>;
  title?: string;
  titleKey?: string;
}

export function SettingBoolean({ setting, title, titleKey }: Props): JSX.Element {
  const settingValue = useSelector((s: RootState) => s.settings[setting]);
  const dispatch = useDispatch();

  const { t } = useTranslation();

  function onChange(value: boolean) {
    setBooleanSetting(dispatch, setting, value);
  }

  return <div
    className="menu-item-setting menu-item-setting-switch"
    onClick={() => onChange(!settingValue)}
  >
    <Switch onChange={onChange} checked={settingValue} style={{ marginRight: 12 }} />
    {titleKey ? t(titleKey) : title}
  </div>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Switch } from "antd";

import { useTranslation } from "react-i18next";

import { SettingName, setBooleanSetting, useBooleanSetting } from "../../utils/settings";

interface Props {
  setting: SettingName<boolean>;
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
}

export function SettingBoolean({
  setting,
  title, titleKey,
  description, descriptionKey
}: Props): JSX.Element {
  const settingValue = useBooleanSetting(setting);

  const { t } = useTranslation();

  function onChange(value: boolean) {
    setBooleanSetting(setting, value);
  }

  return <div
    className="menu-item-setting menu-item-setting-switch"
    onClick={() => onChange(!settingValue)}
  >
    <Switch onChange={onChange} checked={settingValue} style={{ marginRight: 12 }} />
    {titleKey ? t(titleKey) : title}

    {description || descriptionKey && (
      <div className="menu-item-description menu-item-setting-description">
        {descriptionKey ? t(descriptionKey) : description}
      </div>
    )}
  </div>;
}

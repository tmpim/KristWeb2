// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Input, InputNumber, Button } from "antd";

import { useTranslation } from "react-i18next";

import { SettingName, setIntegerSetting, useIntegerSetting, validateIntegerSetting } from "@utils/settings";
import { SettingDescription } from "./SettingDescription";

interface Props {
  setting: SettingName<number>;
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
}

export function SettingInteger({
  setting,
  title, titleKey,
  description, descriptionKey
}: Props): JSX.Element {
  const settingValue = useIntegerSetting(setting);
  const [value, setValue] = useState<string | number>(settingValue);

  const { t } = useTranslation();

  const numVal = value ? Number(value) : undefined;
  const isValid = numVal !== undefined
    && !isNaN(numVal)
    && validateIntegerSetting(setting, numVal);

  function onSave() {
    if (!isValid) return;
    setIntegerSetting(setting, numVal!);
  }

  return <div className="menu-item-setting menu-item-setting-integer">
    <Input.Group compact>
      {/* Number input */}
      <InputNumber
        value={value}
        onChange={setValue}
        onPressEnter={onSave}
      />

      {/* Save button */}
      <Button
        type="primary"
        disabled={settingValue === Number(value) || !isValid}
        onClick={onSave}
      >
        {t("settings.settingIntegerSave")}
      </Button>
    </Input.Group>

    {titleKey ? t(titleKey) : title}

    <SettingDescription description={description} descriptionKey={descriptionKey} />
  </div>;
}

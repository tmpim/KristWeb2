// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Menu } from "antd";
import { LinkOutlined } from "@ant-design/icons";

import { HashLink } from "react-router-hash-link";

import { useTranslation } from "react-i18next";

import { SettingDescription } from "./SettingDescription";

interface Props {
  link: string;
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
}

export function SettingLink({
  link,
  title, titleKey,
  description, descriptionKey,
  ...props
}: Props): JSX.Element {
  const { t } = useTranslation();

  return <Menu.Item {...props}>
    <HashLink to={link}>
      <div className="menu-item-setting menu-item-setting-link">
        <LinkOutlined />{titleKey ? t(titleKey) : title}
        <SettingDescription description={description} descriptionKey={descriptionKey} />
      </div>
    </HashLink>
  </Menu.Item>;
}

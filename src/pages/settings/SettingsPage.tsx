// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { FC } from "react";
import { Menu } from "antd";
import { BugOutlined, GlobalOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PageLayout, PageLayoutProps } from "../../layout/PageLayout";
import { SettingBoolean } from "./SettingBoolean";

interface SettingsPageLayoutProps extends PageLayoutProps {
  pageName?: string;
}
export const SettingsPageLayout: FC<SettingsPageLayoutProps> = ({ pageName, children, ...rest }) => {
  return <PageLayout
    siteTitleKey="settings.siteTitle"
    titleKey="settings.title"
    subTitleKey={pageName ? "settings.subTitle" + pageName : undefined}
    {...rest}
  >
    {children}
  </PageLayout>;
};

export function SettingsPage(): JSX.Element {
  const { t } = useTranslation();

  return <SettingsPageLayout>
    <Menu mode="inline" className="big-menu" selectable={false}>
      <Menu.Item key="language" icon={<GlobalOutlined />}>{t("settings.menuLanguage")}</Menu.Item>

      <Menu.SubMenu key="sub1" icon={<BugOutlined />} title={t("settings.subMenuDebug")}>
        <Menu.Item key="debug/advancedWalletFormats">
          <SettingBoolean setting="walletFormats" titleKey="settings.advancedWalletFormats" />
        </Menu.Item>

        <Menu.Item key="debug/translations">
          <Link to="/settings/debug/translations">{t("settings.menuTranslations")}</Link>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  </SettingsPageLayout>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC } from "react";
import { Menu } from "antd";
import {
  BugOutlined, GlobalOutlined, ReloadOutlined, SettingOutlined, LockOutlined
} from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PageLayout, PageLayoutProps } from "@layout/PageLayout";
import { SettingsGroup, booleanSetting, integerSetting } from "./SettingsGroup";
import { SettingBoolean } from "./SettingBoolean";
import { getLanguageItems } from "./translations/LanguageItem";

import { useSettingsManage } from "./manage/SettingsManage";

import "./SettingsPage.less";

interface SettingsPageLayoutProps extends PageLayoutProps {
  pageName?: string;
}
export const SettingsPageLayout: FC<SettingsPageLayoutProps> = ({ pageName, children, ...rest }) => {
  return <PageLayout
    className="settings-page"
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

  const [manageSettings, manageSettingsCtx] = useSettingsManage();

  return <SettingsPageLayout>
    <Menu mode="inline" className="big-menu" selectable={false}>
      {/* Language selector */}
      <Menu.SubMenu key="sub-language" icon={<GlobalOutlined />} title={t("settings.menuLanguage")}>
        {getLanguageItems()}
      </Menu.SubMenu>

      {/* Backups, master password */}
      {manageSettings}
      {manageSettingsCtx}

      {/* Auto-refresh settings */}
      <SettingsGroup
        subKey="AutoRefresh"
        icon={<ReloadOutlined />}
        settings={[
          booleanSetting("autoRefreshTables"),
          booleanSetting("autoRefreshAddressPage"),
          booleanSetting("autoRefreshNamePage")
        ]}
      />

      {/* Advanced settings */}
      <SettingsGroup
        subKey="Advanced"
        icon={<SettingOutlined />}
        settings={[
          booleanSetting("alwaysIncludeMined"),
          booleanSetting("copyNameSuffixes"),
          booleanSetting("addressCopyButtons"),
          booleanSetting("nameCopyButtons"),
          booleanSetting("blockHashCopyButtons"),
          booleanSetting("showRelativeDates"),
          booleanSetting("showNativeDates"),
          booleanSetting("transactionsHighlightOwn"),
          booleanSetting("transactionsHighlightVerified"),
          booleanSetting("transactionDefaultRaw"),
          booleanSetting("confirmTransactions"),
          booleanSetting("clearTransactionForm"),
          integerSetting("sendTransactionDelay"),
          integerSetting("defaultPageSize"),
          booleanSetting("tableHotkeys")
        ]}
      />

      {/* Privacy settings */}
      <SettingsGroup
        subKey="Privacy"
        icon={<LockOutlined />}
        settings={[
          booleanSetting("errorReporting"),
          booleanSetting("messageOnErrorReport")
        ]}
      />

      {/* Debug settings */}
      <Menu.SubMenu key="sub-debug" icon={<BugOutlined />} title={t("settings.subMenuDebug")}>
        {/* Advanced wallet formats */}
        <Menu.Item key="debug/advancedWalletFormats">
          <SettingBoolean setting="walletFormats" titleKey="settings.advancedWalletFormats" />
        </Menu.Item>

        {/* Translations management */}
        <Menu.Item key="debug/translations">
          <Link to="/settings/debug/translations">{t("settings.menuTranslations")}</Link>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  </SettingsPageLayout>;
}

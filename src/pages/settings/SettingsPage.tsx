// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC } from "react";
import { Menu } from "antd";
import { BugOutlined, GlobalOutlined, ReloadOutlined, SettingOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PageLayout, PageLayoutProps } from "@layout/PageLayout";
import { SettingBoolean } from "./SettingBoolean";
import { SettingInteger } from "./SettingInteger";
import { getLanguageItems } from "./translations/LanguageItem";

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

  return <SettingsPageLayout>
    <Menu mode="inline" className="big-menu" selectable={false}>
      {/* Language selector */}
      <Menu.SubMenu key="sub-language" icon={<GlobalOutlined />} title={t("settings.menuLanguage")}>
        {getLanguageItems()}
      </Menu.SubMenu>

      {/* Auto-refresh settings */}
      <Menu.SubMenu key="sub-autoRefresh" icon={<ReloadOutlined />} title={t("settings.subMenuAutoRefresh")}>
        {/* Auto-refresh tables */}
        <Menu.Item key="autoRefresh/autoRefreshTables">
          <SettingBoolean
            setting="autoRefreshTables"
            titleKey="settings.autoRefreshTables"
            descriptionKey="settings.autoRefreshTablesDescription"
          />
        </Menu.Item>

        {/* Auto-refresh tables */}
        <Menu.Item key="autoRefresh/autoRefreshAddressPage">
          <SettingBoolean setting="autoRefreshAddressPage" titleKey="settings.autoRefreshAddressPage"/>
        </Menu.Item>
      </Menu.SubMenu>

      {/* Advanced settings */}
      <Menu.SubMenu key="sub-advanced" icon={<SettingOutlined />} title={t("settings.subMenuAdvanced")}>
        {/* Always include mined transactions */}
        <Menu.Item key="advanced/alwaysIncludeMined">
          <SettingBoolean setting="alwaysIncludeMined" titleKey="settings.alwaysIncludeMined" />
        </Menu.Item>

        {/* Copy name suffixes */}
        <Menu.Item key="advanced/copyNameSuffixes">
          <SettingBoolean setting="copyNameSuffixes" titleKey="settings.copyNameSuffixes" />
        </Menu.Item>

        {/* Address copy buttons */}
        <Menu.Item key="advanced/addressCopyButtons">
          <SettingBoolean setting="addressCopyButtons" titleKey="settings.addressCopyButtons" />
        </Menu.Item>

        {/* Name copy buttons */}
        <Menu.Item key="advanced/nameCopyButtons">
          <SettingBoolean setting="nameCopyButtons" titleKey="settings.nameCopyButtons" />
        </Menu.Item>

        {/* Block hash copy buttons */}
        <Menu.Item key="advanced/blockHashCopyButtons">
          <SettingBoolean setting="blockHashCopyButtons" titleKey="settings.blockHashCopyButtons" />
        </Menu.Item>

        {/* Show relative dates */}
        <Menu.Item key="advanced/showRelativeDates">
          <SettingBoolean
            setting="showRelativeDates"
            titleKey="settings.showRelativeDates"
            descriptionKey="settings.showRelativeDatesDescription"
          />
        </Menu.Item>

        {/* Default to 'Raw' on transaction page */}
        <Menu.Item key="advanced/transactionDefaultRaw">
          <SettingBoolean setting="transactionDefaultRaw" titleKey="settings.transactionDefaultRaw" />
        </Menu.Item>

        {/* Default page size for table listings */}
        <Menu.Item key="advanced/defaultPageSize">
          <SettingInteger setting="defaultPageSize" titleKey="settings.defaultPageSize" />
        </Menu.Item>
      </Menu.SubMenu>

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

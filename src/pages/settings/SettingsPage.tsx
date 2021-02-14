import React, { FunctionComponent } from "react";
import { Menu } from "antd";
import { BugOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PageLayout, PageLayoutProps } from "../../layout/PageLayout";

interface SettingsPageLayoutProps extends PageLayoutProps {
  pageName?: string;
}
export const SettingsPageLayout: FunctionComponent<SettingsPageLayoutProps> = ({ pageName, children, ...rest }) => {
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
    <Menu mode="inline" className="big-menu">
      <Menu.SubMenu key="sub1" icon={<BugOutlined />} title={t("settings.subMenuDebug")}>
        <Menu.Item key="debug/translations">
          <Link to="/settings/debug/translations">{t("settings.menuTranslations")}</Link>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  </SettingsPageLayout>;
}

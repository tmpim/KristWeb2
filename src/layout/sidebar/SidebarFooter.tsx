// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useTranslation, Trans } from "react-i18next";

import { getAuthorInfo, useHostInfo } from "@utils/credits";

import { ConditionalLink } from "@comp/ConditionalLink";

declare const __GIT_VERSION__: string;
declare const __PKGBUILD__: string;

export function SidebarFooter(): JSX.Element {
  const { t } = useTranslation();

  const { authorName, authorURL, gitURL } = getAuthorInfo();
  const host = useHostInfo();

  // Replaced by webpack DefinePlugin and git-revision-webpack-plugin
  const gitVersion: string = __GIT_VERSION__;
  const pkgbuild = __PKGBUILD__;

  return (
    <div className="site-sidebar-footer">
      <div><Trans t={t} i18nKey="sidebar.madeBy">
        Made by <a href={authorURL} target="_blank" rel="noopener noreferrer">{{authorName}}</a>
      </Trans></div>
      { host &&
        <div><Trans t={t} i18nKey="sidebar.hostedBy">
          Hosted by <a href={host.host.url} target="_blank" rel="noopener noreferrer">{{ host: host.host.name }}</a>
        </Trans></div>
      }
      <div>
        <a href={gitURL} target="_blank" rel="noopener noreferrer">{t("sidebar.github")}</a>
        &nbsp;&ndash;&nbsp;
        <ConditionalLink to="/whatsnew" matchTo>
          {t("sidebar.whatsNew")}
        </ConditionalLink>
        &nbsp;&ndash;&nbsp;
        <ConditionalLink to="/credits" matchTo>
          {t("sidebar.credits")}
        </ConditionalLink>
      </div>

      {/* Git describe version */}
      <div className="site-sidebar-footer-version">
        {gitVersion}-{pkgbuild}
      </div>
    </div>
  );
}

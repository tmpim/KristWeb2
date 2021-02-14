import React from "react";
import { useTranslation, Trans } from "react-i18next";

import packageJson from "../../../package.json";
import { Link } from "react-router-dom";

const req = require.context("../../", false, /\.\/host.json$/);

export function SidebarFooter(): JSX.Element {
  const { t } = useTranslation();

  const authorName = packageJson.author || "Lemmmy";
  const authorURL = `https://github.com/${authorName}`;
  const gitURL = packageJson.repository.url.replace(/\.git$/, "");

  // Add the host information if host.json exists
  let host;
  if (req.keys().includes("./host.json")) {
    host = req("./host.json");
  }

  return (
    <div className="site-sidebar-footer">
      <div><Trans t={t} i18nKey="sidebar.madeBy">
        Made by <a href={authorURL} target="_blank" rel="noopener noreferrer">{{authorName}}</a>
      </Trans></div>
      { host &&
        <div><Trans t={t} i18nKey="sidebar.hostedBy">
          Hosted by <a href={host.url} target="_blank" rel="noopener noreferrer">{{ host: host.name }}</a>
        </Trans></div>
      }
      <div>
        <a href={gitURL} target="_blank" rel="noopener noreferrer">{t("sidebar.github")}</a>
        &nbsp;&ndash;&nbsp;
        <Link to="/credits">{t("sidebar.credits")}</Link>
      </div>
    </div>
  );
}

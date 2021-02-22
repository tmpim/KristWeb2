// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";

import { Link } from "react-router-dom";

import { useMountEffect } from "../../utils";
import { getAuthorInfo } from "../../utils/credits";

export function SidebarFooter(): JSX.Element {
  const { t } = useTranslation();
  const [host, setHost] = useState<{ host: { name: string; url: string } } | undefined>();

  useMountEffect(() => {
    (async () => {
      try {
        // Add the host information if host.json exists
        const hostFile = "host-attribution"; // Trick webpack into dynamic importing
        const hostData = await import("../../__data__/" + hostFile + ".json");
        setHost(hostData);
      } catch (ignored) {
        // Ignored
      }
    })();
  });

  const { authorName, authorURL, gitURL } = getAuthorInfo();

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
        <Link to="/credits">{t("sidebar.credits")}</Link>
      </div>
    </div>
  );
}

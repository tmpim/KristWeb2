// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Card, Alert } from "antd";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { useTranslation } from "react-i18next";

import Markdown from "markdown-to-jsx";
import { useMarkdownLink } from "@comp/krist/MarkdownLink";
import { DateTime } from "@comp/DateTime";

export function MOTDCard(): JSX.Element {
  const { t } = useTranslation();
  const { motd, motdSet, debugMode }
    = useSelector((s: RootState) => s.node.motd);

  // Make relative links start with the sync node, and override all links to
  // open in a new tab
  const MarkdownLink = useMarkdownLink();

  return <Card title={t("dashboard.motdCardTitle")} className="kw-card dashboard-card-motd">
    {debugMode && <Alert type="error" message={t("dashboard.motdDebugMode")} />}

    <p>
      <Markdown options={{
        disableParsingRawHTML: true,
        overrides: { a: MarkdownLink }
      }}>
        {motd}
      </Markdown>
    </p>

    <DateTime date={motdSet} timeAgo small secondary />
  </Card>;
}

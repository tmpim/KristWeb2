// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Typography, Descriptions, Divider } from "antd";
import { useTranslation, Trans } from "react-i18next";

import { PageLayout } from "@layout/PageLayout";
import { Supporters } from "./Supporters";
import { Translators } from "./Translators";
import { DateTime } from "@comp/DateTime";

import { getAuthorInfo, useHostInfo } from "@utils/credits";

import "./CreditsPage.less";

const { Title, Text } = Typography;

declare const __GIT_VERSION__: string;
declare const __GIT_COMMIT_HASH__: string;
declare const __BUILD_TIME__: string;

export function CreditsPage(): JSX.Element {
  const { t } = useTranslation();

  const { authorName, authorURL } = getAuthorInfo();
  const host = useHostInfo();

  // Replaced by webpack DefinePlugin and git-revision-webpack-plugin
  const gitVersion: string = __GIT_VERSION__;
  const gitCommitHash: string = __GIT_COMMIT_HASH__;
  const buildTime: string = __BUILD_TIME__;

  return <PageLayout siteTitleKey="credits.title" className="page-credits" noHeader>
    <Title level={1}>KristWeb v2</Title>

    {/* Made by */}
    <div><Trans t={t} i18nKey="credits.madeBy">
      Made by
      <a href={authorURL} target="_blank" rel="noopener noreferrer">
        {{authorName}}
      </a>
    </Trans></div>

    {/* Hosted by */}
    { host &&
      <div><Trans t={t} i18nKey="credits.hostedBy">
        Hosted by
        <a href={host.host.url} target="_blank" rel="noopener noreferrer">
          {{ host: host.host.name }}
        </a>
      </Trans></div>
    }

    {/* Version/build info */}
    <Descriptions
      className="credits-version-info"
      size="small"
      bordered
      column={2}
    >
      {/* Git describe version */}
      <Descriptions.Item label={t("credits.versionInfo.version")}>
        <Text code>{gitVersion}</Text>
      </Descriptions.Item>

      {/* Build time */}
      <Descriptions.Item label={t("credits.versionInfo.buildTime")}>
        <DateTime date={new Date(buildTime)} neverRelative />
      </Descriptions.Item>

      {/* Git commit hash */}
      <Descriptions.Item label={t("credits.versionInfo.commitHash")}>
        <Text code>{gitCommitHash}</Text>
      </Descriptions.Item>
    </Descriptions>

    {/* Supporters */}
    <Divider>{t("credits.supportersTitle")}</Divider>
    <Supporters />

    {/* Translators */}
    <Divider>{t("credits.translatorsTitle")}</Divider>
    <Translators />

    <Divider>{t("credits.tmpim")}</Divider>
    <a href="https://tmpim.pw" target="_blank" rel="noopener noreferrer">
      <img src="/img/tmpim.svg" alt={t("credits.tmpim")} style={{ borderRadius: 6 }}/>
    </a>
  </PageLayout>;
}

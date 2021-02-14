import React from "react";
import { Typography, Divider } from "antd";
import { useTranslation, Trans } from "react-i18next";

import packageJson from "../../../package.json";

import { PageLayout } from "../../layout/PageLayout";
import { Supporters } from "./Supporters";
import { Translators } from "./Translators";
import "./CreditsPage.less";

const { Title } = Typography;

export function CreditsPage(): JSX.Element {
  const { t } = useTranslation();

  const authorName = packageJson.author || "Lemmmy";
  const authorURL = `https://github.com/${authorName}`;

  return <PageLayout siteTitleKey="credits.title" className="page-credits" noHeader>
    <Title level={1}>KristWeb v2</Title>
    <p><Trans t={t} i18nKey="credits.madeBy">
      Made by <a href={authorURL} target="_blank" rel="noopener noreferrer">{{authorName}}</a>
    </Trans></p>

    <Divider>{t("credits.supportersTitle")}</Divider>
    <Supporters />

    <Divider>{t("credits.translatorsTitle")}</Divider>
    <Translators />

    <Divider>{t("credits.tmpim")}</Divider>
    <a href="https://tmpim.pw" target="_blank" rel="noopener noreferrer">
      <img src="/img/tmpim.svg" alt={t("credits.tmpim")} style={{ borderRadius: 6 }}/>
    </a>
  </PageLayout>;
}

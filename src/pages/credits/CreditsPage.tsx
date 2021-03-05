// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Typography, Divider } from "antd";
import { useTranslation, Trans } from "react-i18next";

import { PageLayout } from "../../layout/PageLayout";
import { Supporters } from "./Supporters";
import { Translators } from "./Translators";
import "./CreditsPage.less";

import { getAuthorInfo } from "@utils/credits";

const { Title } = Typography;

export function CreditsPage(): JSX.Element {
  const { t } = useTranslation();

  const { authorName, authorURL } = getAuthorInfo();

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

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Alert } from "antd";

import { useTranslation, Trans } from "react-i18next";

import { getAuthorInfo } from "@utils";

export function InDevBanner(): JSX.Element {
  const { t } = useTranslation();

  const { gitURL } = getAuthorInfo();

  return <Alert
    style={{ marginBottom: 24 }}
    type="info"
    message={<Trans t={t} i18nKey="dashboard.inDevBanner">
      Welcome to the KristWeb v2 private beta! This site is still in development,
      so most features are currently missing. Please report all bugs on
      <a href={gitURL + "/issues/new"} target="_blank" rel="noopener noreferrer">GitHub</a>.
      Thanks!
    </Trans>}
  />;
}

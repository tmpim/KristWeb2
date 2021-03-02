// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { SmallResult } from "../../components/SmallResult";

export function BlocksResult(): JSX.Element {
  const { t } = useTranslation();

  return <SmallResult
    status="error"
    icon={<QuestionCircleOutlined />}
    title={t("blocks.resultUnknownTitle")}
    subTitle={t("blocks.resultUnknown")}
    fullPage
  />;
}

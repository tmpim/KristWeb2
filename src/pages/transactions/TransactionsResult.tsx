// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { ExclamationCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { SmallResult } from "../../components/SmallResult";
import { APIError } from "../../krist/api";

interface Props {
  error: Error;
}

export function TransactionsResult({ error }: Props): JSX.Element {
  const { t } = useTranslation();

  // Handle the most commonly expected errors from the API
  if (error instanceof APIError) {
    // Invalid address list
    if (error.message === "invalid_parameter") {
      return <SmallResult
        status="error"
        icon={<ExclamationCircleOutlined />}
        title={t("transactions.resultInvalidTitle")}
        subTitle={t("transactions.resultInvalid")}
        fullPage
      />;
    }
  }

  // Unknown error
  return <SmallResult
    status="error"
    icon={<QuestionCircleOutlined />}
    title={t("transactions.resultUnknownTitle")}
    subTitle={t("transactions.resultUnknown")}
    fullPage
  />;
}

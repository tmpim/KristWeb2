// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Button } from "antd";
import { FrownOutlined } from "@ant-design/icons";

import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { SmallResult } from "../components/SmallResult";

export function NotFoundPage(): JSX.Element {
  const { t } = useTranslation();
  const history = useHistory();

  return <SmallResult
    icon={<FrownOutlined />}
    status="error"
    title={t("pageNotFound.resultTitle")}
    extra={(
      <Button type="primary" onClick={() => history.goBack()}>
        {t("pageNotFound.buttonGoBack")}
      </Button>
    )}
    fullPage
  />;
}

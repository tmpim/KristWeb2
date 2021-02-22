import React from "react";
import { Alert } from "antd";

import { useTranslation } from "react-i18next";

export function StatusPage(): JSX.Element {
  const { t } = useTranslation();

  return <Alert type="error" message={t("status")} />;
}

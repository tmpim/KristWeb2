import React from "react";

import { useTranslation } from "react-i18next";

import "./ConnectionIndicator.scss";

export const ConnectionIndicator = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div id="connection-indicator" className="connection-connected">
      {t("nav.connection.online")}
    </div>
  );
};

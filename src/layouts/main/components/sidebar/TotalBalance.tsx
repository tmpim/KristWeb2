import React from "react";

import { useTranslation } from "react-i18next";

import { KristValue } from "@components/krist-value/KristValue";

import "./TotalBalance.scss";

interface Props {
  balance: number;
};

export const TotalBalance: React.FC<Props> = ({ balance }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="nav-total-balance">
      <h5>{t("sidebar.totalBalance")}</h5>
      <KristValue value={balance} long />
    </div>
  );
};

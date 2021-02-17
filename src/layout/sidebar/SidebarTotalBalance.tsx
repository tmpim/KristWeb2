import React from "react";
import { useTranslation } from "react-i18next";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";

import { KristValue } from "../../components/KristValue";

export function SidebarTotalBalance(): JSX.Element {
  const { t } = useTranslation();

  const { wallets } = useSelector((s: RootState) => s.wallets, shallowEqual);
  const balance = Object.values(wallets)
    .filter(w => w.balance !== undefined)
    .reduce((acc, w) => acc + w.balance!, 0);

  return (
    <div className="site-sidebar-header site-sidebar-total-balance">
      <h5>{t("sidebar.totalBalance")}</h5>
      <KristValue value={balance} long />
    </div>
  );
}

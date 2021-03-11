// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useTranslation } from "react-i18next";

import { useWallets } from "@wallets";
import { KristValue } from "@comp/krist/KristValue";

export function SidebarTotalBalance(): JSX.Element {
  const { t } = useTranslation();

  const { wallets } = useWallets();
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

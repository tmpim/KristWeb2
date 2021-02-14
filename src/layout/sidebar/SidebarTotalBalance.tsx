import { useTranslation } from "react-i18next";

import { KristValue } from "../../components/KristValue";

export function SidebarTotalBalance({ balance }: { balance: number }) {
  const { t } = useTranslation();

  return (
    <div className="site-sidebar-header site-sidebar-total-balance">
      <h5>{t("sidebar.totalBalance")}</h5>
      <KristValue value={balance} long />
    </div>
  );
}

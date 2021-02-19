import React from "react";
import { Card, Row, Col, Typography } from "antd";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Wallet } from "../../krist/wallets/Wallet";

import { KristValue } from "../../components/KristValue";
import { Statistic } from "./Statistic";

import { keyedNullSort } from "../../utils";

export function WalletPreview({ wallet }: { wallet: Wallet }): JSX.Element {
  return <Row className="dashboard-wallet-preview">
    <Col className="wallet-left">
      {wallet.label && <span className="wallet-label">{wallet.label}</span>}
      <span className="wallet-address">{wallet.address}</span>
    </Col>

    <Col className="wallet-right">
      <KristValue value={wallet.balance} />
    </Col>
  </Row>;
}

export function WalletOverviewCard(): JSX.Element {
  const { wallets } = useSelector((s: RootState) => s.wallets, shallowEqual);
  const { t } = useTranslation();

  const clonedWallets = [...Object.values(wallets)];

  const balance = clonedWallets.filter(w => w.balance !== undefined)
    .reduce((acc, w) => acc + w.balance!, 0);
  const names = clonedWallets.filter(w => w.names !== undefined)
    .reduce((acc, w) => acc + w.names!, 0);

  const topWallets = [...clonedWallets];
  const sort = keyedNullSort<Wallet>("balance", undefined);
  topWallets.sort((a: Wallet, b: Wallet) => sort(a, b, "descend"));
  topWallets.reverse();
  const top4Wallets = topWallets.slice(0, 4);

  return <Card title={t("dashboard.walletOverviewCardTitle")} className="dashboard-card dashboard-card-wallets">
    <Row gutter={16} className="dashboard-wallets-top-row">
      <Col span={12} className="dashboard-wallets-balance">
        <Statistic
          titleKey="dashboard.walletOverviewTotalBalance"
          value={<KristValue value={balance} long className={balance > 0 ? "" : "empty"} />}
        />
      </Col>

      <Col span={12} className="dashboard-wallets-names">
        <Statistic
          titleKey="dashboard.walletOverviewNames"
          value={t("dashboard.walletOverviewNamesCount", { count: names })}
        />
      </Col>
    </Row>

    {top4Wallets.map(w => <WalletPreview key={w.id} wallet={w} />)}

    <Row className="dashboard-wallets-more dashboard-more">
      <Link to="/wallets">
        {clonedWallets.length > 0
          ? t("dashboard.walletOverviewSeeMore", { count: clonedWallets.length })
          : t("dashboard.walletOverviewAddWallets")}
      </Link>
    </Row>
  </Card>;
}

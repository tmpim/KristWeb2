// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Row, Col } from "antd";

import { Wallet } from "@wallets";

import { KristValue } from "@comp/krist/KristValue";

export function WalletItem({ wallet }: { wallet: Wallet }): JSX.Element {
  return <Row className="card-list-item dashboard-wallet-item">
    <Col className="wallet-left">
      {wallet.label && <span className="wallet-label">{wallet.label}</span>}
      <span className="wallet-address">{wallet.address}</span>
    </Col>

    <Col className="wallet-right">
      <KristValue value={wallet.balance} highlightZero />
    </Col>
  </Row>;
}

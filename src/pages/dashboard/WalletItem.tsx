// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Row, Col } from "antd";

import { Wallet } from "../../krist/wallets/Wallet";

import { KristValue } from "../../components/KristValue";

export function WalletItem({ wallet }: { wallet: Wallet }): JSX.Element {
  return <Row className="dashboard-list-item dashboard-wallet-item">
    <Col className="wallet-left">
      {wallet.label && <span className="wallet-label">{wallet.label}</span>}
      <span className="wallet-address">{wallet.address}</span>
    </Col>

    <Col className="wallet-right">
      <KristValue value={wallet.balance} />
    </Col>
  </Row>;
}

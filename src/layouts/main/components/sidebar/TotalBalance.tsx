import React from "react";
import { KristValue } from "@components/krist-value";

import "./TotalBalance.scss";

type Props = {
  balance: number
};

export const TotalBalance: React.FC<Props> = ({ balance }: Props) => (
  <div className="nav-total-balance">
    <h5>Total Balance</h5>
    <KristValue value={balance} long />
  </div>
);

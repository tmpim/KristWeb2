import React, { Component } from "react";
import PropTypes from "prop-types";

import { KristValue } from "@components/krist-value";

import "./TotalBalance.scss";

type TotalBalanceProps = {
  balance: number
};

export class TotalBalance extends Component<TotalBalanceProps> {
  public static propTypes = {
    balance: PropTypes.number.isRequired
  }

  render() {
    const { balance } = this.props;

    return <div id="nav-total-balance">
      <h5>Total Balance</h5>
      <KristValue value={balance} long />
    </div>
  }
}
// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useCallback } from "react";
import { Menu } from "antd";
import {
  ProfileOutlined, SendOutlined, EditOutlined, InfoCircleOutlined,
  DeleteOutlined
} from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { useHistory } from "react-router-dom";

import { Wallet } from "@wallets";

import { useAuth } from "@comp/auth";
import { OpenEditWalletFn } from "./WalletEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";
import { OpenWalletInfoFn } from "./info/WalletInfoModal";
import { showWalletDeleteConfirmModal } from "./WalletActions";

interface Props {
  wallet: Wallet;

  openEditWallet: OpenEditWalletFn;
  openSendTx: OpenSendTxFn;
  openWalletInfo: OpenWalletInfoFn;
}

export function WalletMobileItemActions({
  wallet,
  openEditWallet,
  openSendTx,
  openWalletInfo
}: Props): JSX.Element {
  const { t, tStr } = useTFns("myWallets.");

  const history = useHistory();
  const promptAuth = useAuth();

  const showWalletDeleteConfirm = useCallback(
    () => showWalletDeleteConfirmModal(t, tStr, wallet),
    [t, tStr, wallet]
  );

  const addressLink = `/network/addresses/${encodeURIComponent(wallet.address)}`;
  const addressExists = !!wallet.firstSeen;

  return <Menu selectable={false}>
    {/* View address */}
    <Menu.Item key="1" disabled={!addressExists} icon={<ProfileOutlined />}
      onClick={() => history.push(addressLink)}>
      {tStr("actionsViewAddress")}
    </Menu.Item>

    {/* Send Krist */}
    <Menu.Item key="2" icon={<SendOutlined />}
      onClick={() => promptAuth(false, () => openSendTx(wallet))}>
      {tStr("actionsSendTransaction")}
    </Menu.Item>

    <Menu.Divider />

    {/* Edit wallet */}
    <Menu.Item key="3" icon={<EditOutlined />}
      onClick={() => promptAuth(false, () => openEditWallet(wallet))}>
      {tStr("actionsEditTooltip")}
    </Menu.Item>

    {/* Wallet info */}
    <Menu.Item key="4" icon={<InfoCircleOutlined />}
      onClick={() => openWalletInfo(wallet)}>
      {tStr("actionsWalletInfo")}
    </Menu.Item>

    <Menu.Divider />

    {/* Delete wallet */}
    <Menu.Item key="5" danger icon={<DeleteOutlined />}
      onClick={showWalletDeleteConfirm}>
      {tStr("actionsDelete")}
    </Menu.Item>
  </Menu>;
}

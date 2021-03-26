// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useCallback, useMemo } from "react";
import { Modal, Dropdown, Menu } from "antd";
import {
  EditOutlined, DeleteOutlined, InfoCircleOutlined, ExclamationCircleOutlined,
  SendOutlined
} from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { useAuth } from "@comp/auth";
import { OpenEditWalletFn } from "./WalletEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";
import { OpenWalletInfoFn } from "./info/WalletInfoModal";

import { Wallet, deleteWallet } from "@wallets";

interface Props {
  wallet: Wallet;
  openEditWallet: OpenEditWalletFn;
  openSendTx: OpenSendTxFn;
  openWalletInfo: OpenWalletInfoFn;
}

export function WalletActions({
  wallet,
  openEditWallet,
  openSendTx,
  openWalletInfo,
}: Props): JSX.Element {
  const { t, tStr } = useTFns("myWallets.");
  const promptAuth = useAuth();

  const showWalletDeleteConfirm = useCallback((): void => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,

      title: tStr("actionsDeleteConfirm"),
      content: tStr("actionsDeleteConfirmDescription"),

      onOk: () => deleteWallet(wallet),
      okText: t("dialog.yes"),
      okType: "danger",
      cancelText: t("dialog.no")
    });
  }, [t, tStr, wallet]);

  const memoDropdown = useMemo(() => <Dropdown.Button
    className="table-actions wallet-actions"

    onClick={() => promptAuth(true, () => openEditWallet(wallet))}
    trigger={["click"]}
    overlay={() => (
      <Menu>
        {/* Send tx button */}
        <Menu.Item key="1" icon={<SendOutlined />}
          onClick={() => promptAuth(false, () => openSendTx(wallet))}>
          {tStr("actionsSendTransaction")}
        </Menu.Item>

        {/* Wallet info button */}
        <Menu.Item key="2" icon={<InfoCircleOutlined />}
          onClick={() => openWalletInfo(wallet)}>
          {tStr("actionsWalletInfo")}
        </Menu.Item>

        <Menu.Divider />

        {/* Delete button */}
        <Menu.Item key="3" danger icon={<DeleteOutlined />}
          onClick={showWalletDeleteConfirm}>
          {tStr("actionsDelete")}
        </Menu.Item>
      </Menu>
    )}
  >
    {/* Edit button */}
    <EditOutlined />
  </Dropdown.Button>, [
    tStr, wallet, promptAuth,
    openEditWallet, openSendTx, openWalletInfo, showWalletDeleteConfirm
  ]);

  return memoDropdown;
}

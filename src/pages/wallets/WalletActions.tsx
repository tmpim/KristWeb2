// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Modal, Dropdown, Menu } from "antd";
import { MenuClickEventHandler } from "rc-menu/lib/interface";
import {
  EditOutlined, DeleteOutlined, InfoCircleOutlined, ExclamationCircleOutlined,
  SendOutlined
} from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
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
  const { t } = useTranslation();

  function showWalletDeleteConfirm(): void {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,

      title: t("myWallets.actionsDeleteConfirm"),
      content: t("myWallets.actionsDeleteConfirmDescription"),

      onOk: () => deleteWallet(wallet),
      okText: t("dialog.yes"),
      okType: "danger",
      cancelText: t("dialog.no")
    });
  }

  const onMenuClick: MenuClickEventHandler = e => {
    switch (e.key) {
    // "Wallet info" button
    case "2":
      return openWalletInfo(wallet);

    // "Delete wallet" button
    case "3":
      return showWalletDeleteConfirm();
    }
  };

  return <Dropdown.Button
    className="table-actions wallet-actions"

    buttonsRender={([leftButton, rightButton]) => [
      // Edit wallet button
      <AuthorisedAction
        key="leftButton"
        encrypt
        onAuthed={() => openEditWallet(wallet)}
        popoverPlacement="left"
      >
        {/* Tooltip was removed for now as an optimisation */}
        {/* <Tooltip title={t("myWallets.actionsEditTooltip")}> */}
        {React.cloneElement(leftButton as React.ReactElement<any>, {
          className: "ant-btn-left", // force the border-radius
          disabled: wallet.dontSave
        })}
        {/* </Tooltip> */}
      </AuthorisedAction>,

      // Dropdown button
      rightButton
    ]}

    trigger={["click"]}

    overlay={(
      <Menu onClick={onMenuClick}>
        {/* Send tx button */}
        <Menu.Item key="1">
          <AuthorisedAction
            onAuthed={() => openSendTx(wallet)}
            popoverPlacement="left"
          >
            <div><SendOutlined /> {t("myWallets.actionsSendTransaction")}</div>
          </AuthorisedAction>
        </Menu.Item>

        {/* Wallet info button */}
        <Menu.Item key="2">
          <InfoCircleOutlined /> {t("myWallets.actionsWalletInfo")}
        </Menu.Item>

        <Menu.Divider />

        {/* Delete button */}
        <Menu.Item key="3" danger>
          <DeleteOutlined /> {t("myWallets.actionsDelete")}
        </Menu.Item>
      </Menu>
    )}
  >
    {/* Edit button */}
    <EditOutlined />
  </Dropdown.Button>;
}

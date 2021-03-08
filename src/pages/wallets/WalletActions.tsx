// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState } from "react";
import { Modal, Tooltip, Dropdown, Menu } from "antd";
import { MenuClickEventHandler } from "rc-menu/lib/interface";
import {
  EditOutlined, DeleteOutlined, InfoCircleOutlined, ExclamationCircleOutlined
} from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { WalletEditButton } from "./WalletEditButton";
import { AddWalletModal } from "./AddWalletModal";
import { WalletInfoModal } from "./info/WalletInfoModal";

import { Wallet, deleteWallet } from "@wallets";

export function WalletActions({ wallet }: { wallet: Wallet }): JSX.Element {
  const { t } = useTranslation();
  const [editWalletVisible, setEditWalletVisible] = useState(false);
  const [walletInfoVisible, setWalletInfoVisible] = useState(false);

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

  const onMenuClick: MenuClickEventHandler = (e) => {
    switch (e.key) {
    // "Wallet info" button
    case "1":
      setWalletInfoVisible(true);
      break;

    // "Delete wallet" button
    case "2":
      showWalletDeleteConfirm();
      break;
    }
  };

  return <>
    <Dropdown.Button
      className="wallet-actions"

      buttonsRender={([leftButton, rightButton]) => [
        <WalletEditButton key="leftButton" wallet={wallet}>
          <Tooltip title={t("myWallets.actionsEditTooltip")}>
            {React.cloneElement(leftButton as React.ReactElement<any>, {
              className: "ant-btn-left", // force the border-radius
              disabled: wallet.dontSave
            })}
          </Tooltip>
        </WalletEditButton>,
        rightButton
      ]}

      trigger={["click"]}

      overlay={(
        <Menu onClick={onMenuClick}>
          {/* Wallet info button */}
          <Menu.Item key="1">
            <InfoCircleOutlined /> {t("myWallets.actionsWalletInfo")}
          </Menu.Item>

          <Menu.Divider />

          {/* Delete button */}
          <Menu.Item key="2" danger>
            <DeleteOutlined /> {t("myWallets.actionsDelete")}
          </Menu.Item>
        </Menu>
      )}>

      {/* Edit button */}
      <EditOutlined />
    </Dropdown.Button>

    <AddWalletModal editing={wallet} visible={editWalletVisible} setVisible={setEditWalletVisible} />
    <WalletInfoModal wallet={wallet} visible={walletInfoVisible} setVisible={setWalletInfoVisible} />
  </>;
}

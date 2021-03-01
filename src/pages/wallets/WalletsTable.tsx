// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState } from "react";
import { Table, Tooltip, Dropdown, Tag, Menu, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { ContextualAddress } from "../../components/ContextualAddress";
import { KristValue } from "../../components/KristValue";
import { DateTime } from "../../components/DateTime";
import { WalletEditButton } from "./WalletEditButton";
import { AddWalletModal } from "./AddWalletModal";

import { Wallet, deleteWallet, useWallets } from "../../krist/wallets/Wallet";

import { keyedNullSort, localeSort } from "../../utils";

function WalletActions({ wallet }: { wallet: Wallet }): JSX.Element {
  const { t } = useTranslation();
  const [editWalletVisible, setEditWalletVisible] = useState(false);

  function onDeleteWallet() {
    deleteWallet(wallet);
  }

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

      overlay={(
        <Menu>
          {/* Delete button */}
          <Menu.Item key="1" danger>
            <Popconfirm
              title={t("myWallets.actionsDeleteConfirm")}
              placement="left"
              onConfirm={onDeleteWallet}
              okText={t("dialog.yes")}
              cancelText={t("dialog.no")}
            >
              <DeleteOutlined /> {t("myWallets.actionsDelete")}
            </Popconfirm>
          </Menu.Item>
        </Menu>
      )}>

      {/* Edit button */}
      <EditOutlined />
    </Dropdown.Button>

    <AddWalletModal editing={wallet} visible={editWalletVisible} setVisible={setEditWalletVisible} />
  </>;
}

export function WalletsTable(): JSX.Element {
  const { t } = useTranslation();
  const { wallets } = useWallets();

  // Required to filter by categories
  const categories = [...new Set(Object.values(wallets)
    .filter(w => w.category !== undefined && w.category !== "")
    .map(w => w.category) as string[])];
  localeSort(categories);

  return <Table
    size="small"

    dataSource={Object.values(wallets)}
    rowKey="id"

    pagination={{
      size: "default"
    }}

    columns={[
      // Label
      {
        title: t("myWallets.columnLabel"),
        dataIndex: "label", key: "label",

        render: (label, record) => <>
          {label}
          {record.dontSave && <Tooltip title={t("myWallets.tagDontSaveTooltip")}>
            <Tag style={{ marginLeft: 8, textTransform: "uppercase" }}>{t("myWallets.tagDontSave")}</Tag>
          </Tooltip>}
        </>,
        sorter: keyedNullSort("label", true)
      },

      // Address
      {
        title: t("myWallets.columnAddress"),
        dataIndex: "address", key: "address",

        render: address => <ContextualAddress address={address} wallet={false} />,
        sorter: (a, b) => a.address.localeCompare(b.address)
      },

      // Balance
      {
        title: t("myWallets.columnBalance"),
        dataIndex: "balance", key: "balance",

        render: balance => <KristValue value={balance} hideNullish />,
        sorter: keyedNullSort("balance"),
        defaultSortOrder: "descend"
      },

      // Names
      {
        title: t("myWallets.columnNames"),
        dataIndex: "names", key: "names",
        sorter: keyedNullSort("names")
      },

      // Category
      {
        title: t("myWallets.columnCategory"),
        dataIndex: "category", key: "category",

        filters: categories.map(c => ({ text: c, value: c })),
        onFilter: (value, record) => record.category === value,

        sorter: keyedNullSort("category", true)
      },

      // First seen
      {
        title: t("myWallets.columnFirstSeen"),
        dataIndex: "firstSeen", key: "firstSeen",

        render: firstSeen => <DateTime date={firstSeen} />,
        sorter: keyedNullSort("firstSeen")
      },

      // Actions
      {
        key: "actions",
        width: 80,

        render: (_, record) => <WalletActions wallet={record} />
      }
    ]}
  />;
}

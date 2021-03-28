// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo } from "react";
import { Table, Tooltip, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";

import { useTFns, TStrFn } from "@utils/i18n";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { KristValue } from "@comp/krist/KristValue";
import { DateTime } from "@comp/DateTime";

import { useWallets, useWalletCategories, Wallet } from "@wallets";
import { WalletActions } from "./WalletActions";
import { OpenEditWalletFn } from "./WalletEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";
import { OpenWalletInfoFn } from "./info/WalletInfoModal";

import { keyedNullSort } from "@utils";
import { useDateColumnWidth } from "@utils/table/table";

interface Props {
  openEditWallet: OpenEditWalletFn;
  openSendTx: OpenSendTxFn;
  openWalletInfo: OpenWalletInfoFn;
}

function getColumns(
  tStr: TStrFn,
  categories: string[],
  dateColumnWidth: number,
  openEditWallet: OpenEditWalletFn,
  openSendTx: OpenSendTxFn,
  openWalletInfo: OpenWalletInfoFn
): ColumnsType<Wallet> {
  return [
    // Label
    {
      title: tStr("columnLabel"),
      dataIndex: "label", key: "label",

      render: (label, record) => <>
        {label}
        {record.dontSave && <Tooltip title={tStr("tagDontSaveTooltip")}>
          <Tag style={{ marginLeft: 8, textTransform: "uppercase" }}>{tStr("tagDontSave")}</Tag>
        </Tooltip>}
      </>,
      sorter: keyedNullSort("label", true)
    },

    // Address
    {
      title: tStr("columnAddress"),
      dataIndex: "address", key: "address",

      render: (address, wallet) => (
        <ContextualAddress
          address={address}
          wallet={false}
          contact={false}
          nonExistent={!wallet.firstSeen}
        />
      ),
      sorter: (a, b) => a.address.localeCompare(b.address)
    },

    // Balance
    {
      title: tStr("columnBalance"),
      dataIndex: "balance", key: "balance",

      width: 140,
      render: balance => <KristValue value={balance} hideNullish />,
      sorter: keyedNullSort("balance"),
      defaultSortOrder: "descend"
    },

    // Names
    {
      title: tStr("columnNames"),
      dataIndex: "names", key: "names",
      sorter: keyedNullSort("names"),
      width: 70,
    },

    // Category
    {
      title: tStr("columnCategory"),
      dataIndex: "category", key: "category",

      filters: categories.map(c => ({ text: c, value: c })),
      onFilter: (value, record) => record.category === value,

      sorter: keyedNullSort("category", true)
    },

    // First seen
    {
      title: tStr("columnFirstSeen"),
      dataIndex: "firstSeen", key: "firstSeen",

      // This column isn't too important, hide it on smaller screens
      responsive: ["lg"],

      render: firstSeen => <DateTime date={firstSeen} />,
      width: dateColumnWidth,

      sorter: keyedNullSort("firstSeen")
    },

    // Actions
    {
      key: "actions",
      width: 80,

      render: (_, record) => (
        <WalletActions
          wallet={record}
          openEditWallet={openEditWallet}
          openSendTx={openSendTx}
          openWalletInfo={openWalletInfo}
        />
      )
    }
  ];
}

export function WalletsTable({
  openEditWallet,
  openSendTx,
  openWalletInfo
}: Props): JSX.Element {
  const { tStr } = useTFns("myWallets.");

  const { wallets } = useWallets();
  const { categories, joinedCategoryList } = useWalletCategories();

  const dateColumnWidth = useDateColumnWidth();

  const columns = useMemo(() => getColumns(
    tStr, categories, dateColumnWidth, openEditWallet, openSendTx,
    openWalletInfo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [
    tStr, joinedCategoryList, dateColumnWidth, openEditWallet, openSendTx,
    openWalletInfo
  ]);

  return <Table
    size="small"
    scroll={{ x: true }}

    dataSource={Object.values(wallets)}
    rowKey="id"

    pagination={{
      size: "default"
    }}

    columns={columns}
  />;
}

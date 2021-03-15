// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Table, Tooltip, Tag } from "antd";

import { useTranslation } from "react-i18next";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { KristValue } from "@comp/krist/KristValue";
import { DateTime } from "@comp/DateTime";

import { useWallets } from "@wallets";
import { WalletActions } from "./WalletActions";

import { keyedNullSort, localeSort } from "@utils";
import { useDateColumnWidth } from "@utils/table";

export function WalletsTable(): JSX.Element {
  const { t } = useTranslation();
  const { wallets } = useWallets();

  // Required to filter by categories
  const categories = [...new Set(Object.values(wallets)
    .filter(w => w.category !== undefined && w.category !== "")
    .map(w => w.category) as string[])];
  localeSort(categories);

  const dateColumnWidth = useDateColumnWidth();

  return <Table
    size="small"
    scroll={{ x: true }}

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

        render: (address, wallet) => (
          <ContextualAddress
            address={address}
            wallet={false}
            nonExistent={!wallet.firstSeen}
          />
        ),
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

        render: (_, record) => <WalletActions wallet={record} />
      }
    ]}
  />;
}

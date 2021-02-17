import React from "react";
import { Table } from "antd";

import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";
import { useTranslation } from "react-i18next";

import { KristValue } from "../../components/KristValue";

export function WalletsTable(): JSX.Element {
  const { t } = useTranslation();

  const { wallets } = useSelector((s: RootState) => s.wallets, shallowEqual);
  const dispatch = useDispatch();

  return <Table
    dataSource={Object.values(wallets)}
    rowKey="id"

    columns={[
      {
        title: t("myWallets.columnLabel"),
        dataIndex: "label",
        key: "label"
      },
      {
        title: t("myWallets.columnAddress"),
        dataIndex: "address",
        key: "address"
      },
      {
        title: t("myWallets.columnBalance"),
        dataIndex: "balance",
        key: "balance",
        render: balance => <KristValue value={balance} />
      },
      {
        title: t("myWallets.columnNames"),
        dataIndex: "names",
        key: "names"
      },
      {
        title: t("myWallets.columnCategory"),
        dataIndex: "category",
        key: "category"
      },
      {
        title: t("myWallets.columnFirstSeen"),
        dataIndex: "firstSeen",
        key: "firstSeen"
      }
    ]}
  />;
}

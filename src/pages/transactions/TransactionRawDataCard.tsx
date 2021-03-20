// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Card, Table } from "antd";

import { useTranslation } from "react-i18next";

import { KristTransaction } from "@api/types";

import { HelpIcon } from "@comp/HelpIcon";

export function TransactionRawDataCard({ transaction }: { transaction: KristTransaction }): JSX.Element {
  const { t } = useTranslation();

  // Convert the transaction object to an array of entries {key, value}
  const processed = Object.entries(transaction)
    .map(([key, value]) => ({ key, value }));

  return <Card
    className="kw-card transaction-card-raw-data"
    title={<>
      {t("transaction.cardRawDataTitle")}
      <HelpIcon textKey="transaction.cardRawDataHelp" />
    </>}
  >
    <Table
      className="raw-data-table"
      size="small"

      dataSource={processed}
      rowKey="key"

      columns={[
        // Key
        {
          title: t("transaction.rawDataColumnKey"),
          dataIndex: "key", key: "key"
        },

        // Value
        {
          title: t("transaction.rawDataColumnValue"),
          dataIndex: "value", key: "value",

          className: "transaction-raw-data-cell-value",
          render: value => {
            if (value === null || value === undefined)
              return <span className="transaction-raw-data-null">null</span>;

            return value.toString();
          }
        }
      ]}

      pagination={false}
    />
  </Card>;
}

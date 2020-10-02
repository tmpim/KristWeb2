import React, { Component, ReactNode } from "react";

import { withTranslation, WithTranslation } from "react-i18next";

import { ColumnKey, ColumnSpec, QueryStateBase } from "@components/list-view/DataProvider";
import { formatKristValue, formatDateTime } from "@components/list-view/Formatters";
import { ListView } from "@components/list-view/ListView";

import { SearchTextbox } from "@components/list-view/SearchTextbox";
import { DateString } from "@krist/types/KristTypes";

import { MyTransactionsMobileItem } from "./MyTransactionsMobileItem";

// TODO: Temporary
export interface Transaction {
  id: number;
  from?: string;
  to?: string;
  value: number;
  time: DateString;
  name?: string;
  metadata?: string;
}

const COLUMNS = new Map<ColumnKey<Transaction>, ColumnSpec<Transaction>>()
  .set("from", { nameKey: "myTransactions.columnFrom" })
  .set("to", { nameKey: "myTransactions.columnTo" })
  .set("value", { 
    nameKey: "myTransactions.columnValue",
    formatValue: formatKristValue("value")
  })
  .set("time", { 
    nameKey: "myTransactions.columnTime",
    formatValue: formatDateTime("time")
  });

class MyTransactionsPageComponent extends Component<WithTranslation> {
  render(): ReactNode {
    const { t } = this.props;

    return <ListView<Transaction>
      title={t("myTransactions.title")}
      filters={<>
        {/* Search filter textbox */}
        <SearchTextbox placeholder={t("myTransactions.searchPlaceholder")} />
      </>}
      columns={COLUMNS}
      renderMobileItem={(item: Transaction) => <MyTransactionsMobileItem item={item} />}
      dataProvider={async (query: QueryStateBase<Transaction>) => {
        // Provide the data to the list view
        // TODO: temporary
        return {
          total: 30,
          data: []
        };
      }}
    />;
  }
}

export const MyTransactionsPage = withTranslation()(MyTransactionsPageComponent);

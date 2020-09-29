import React, { Component, ReactNode } from "react";

import { withTranslation, WithTranslation } from "react-i18next";

import { ColumnKey, ColumnSpec, QueryStateBase } from "@components/list-view/DataProvider";
import { formatKristValue, formatDateTime, formatNumber } from "@components/list-view/Formatters";
import { ListView } from "@components/list-view/ListView";

import { IconButton } from "@components/icon-button/IconButton";
import Button from "react-bootstrap/Button";

import { SearchTextbox } from "@components/list-view/SearchTextbox";
import { FilterSelect } from "@components/list-view/FilterSelect";
import { DateString } from "@krist/types/KristTypes";

import { MyWalletsMobileItem } from "./MyWalletsMobileItem";

import { Wallet } from "@krist/wallets/Wallet";

import { sleep } from "@utils";
import { KristWalletFormat } from "@krist/wallets/formats/WalletFormat";

const WALLET_COLUMNS = new Map<ColumnKey<Wallet>, ColumnSpec<Wallet>>()
  .set("label", { nameKey: "myWallets.columnLabel" })
  .set("address", { nameKey: "myWallets.columnAddress" })
  .set("balance", { 
    nameKey: "myWallets.columnBalance",
    formatValue: formatKristValue("balance")
  })
  .set("names", { 
    nameKey: "myWallets.columnNames",
    formatValue: formatNumber("names")
  })
  .set("category", { nameKey: "myWallets.columnCategory" })
  .set("firstSeen", { 
    nameKey: "myWallets.columnFirstSeen",
    formatValue: formatDateTime("firstSeen")
  });

class MyWalletsPageComponent extends Component<WithTranslation> {
  render(): ReactNode {
    const { t } = this.props;

    return <ListView<Wallet>
      title={t("myWallets.title")}
      page={1}
      pages={3}
      actions={<>
        <IconButton size="sm" variant="secondary" icon="database">
          {t("myWallets.manageBackups")}
        </IconButton>
        <IconButton size="sm" variant="success" icon="plus">
          {t("myWallets.createWallet")}
        </IconButton>
        <Button size="sm" variant="outline-primary">
          {/* TODO: find an icon for this */}
          {t("myWallets.addExistingWallet")}
        </Button>
      </>}
      filters={<>
        {/* Search filter textbox */}
        <SearchTextbox placeholder={t("myWallets.searchPlaceholder")} />

        {/* Category selection box */}
        <FilterSelect 
          options={new Map()
            .set("_all", t("myWallets.categoryDropdownAll"))
            .set("shops", "Shops")
          }
        />
      </>}
      columns={WALLET_COLUMNS}
      renderMobileItem={(item: Wallet) => <MyWalletsMobileItem item={item} />}
      dataProvider={async (query: QueryStateBase<Wallet>) => {
        // Provide the data to the list view
        // TODO: temporary
        await sleep((Math.random() * 500) + 10000);
        return {
          total: 30,
          data: [
            {
              id: "9b68f712-8005-4711-8628-3a97d17b5d5d",
              password: "",
              format: "kristwallet",
              label: "Shop Wallet",
              address: "kreichdyes",
              balance: 15364,
              names: 12,
              category: "Shops",
              firstSeen: new Date().toISOString()
            },
            {
              id: "d0de949f-3270-4bcc-b29a-2cd9e42cec58",
              password: "",
              format: "kristwallet",
              label: "Main Wallet",
              address: "khugepoopy",
              balance: 1024,
              names: 3,
              firstSeen: new Date().toISOString()
            },
            {
              id: "2769c209-c323-4850-a79d-774c284b6417",
              password: "",
              format: "kristwallet",
              label: "Old Wallet",
              address: "kre3w0i79j",
              balance: 0,
              names: 0,
              firstSeen: new Date().toISOString()
            },
            {
              id: "0886b802-e871-40f1-b2fc-c39fa295f5c8",
              password: "",
              format: "kristwallet",
              address: "kunlabeled",
              balance: 0,
              names: 0
            }
          ]
        };
      }}
    />;
  }
}

export const MyWalletsPage = withTranslation()(MyWalletsPageComponent);

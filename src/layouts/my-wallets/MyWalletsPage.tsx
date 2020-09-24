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

import { sleep } from "@utils";

// TODO: Temporary
export interface Wallet {
  label?: string;
  address: string;
  balance: number;
  names: number;
  category?: string;
  firstSeen?: DateString;
}

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
      title="23 wallets"
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
        <SearchTextbox placeholder="Search wallets..." />

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
        await sleep((Math.random() * 500) + 250);
        return {
          total: 30,
          data: [
            {
              label: "Shop Wallet",
              address: "kreichdyes",
              balance: 15364,
              names: 12,
              category: "Shops",
              firstSeen: new Date().toISOString()
            },
            {
              label: "Main Wallet",
              address: "khugepoopy",
              balance: 1024,
              names: 3,
              firstSeen: new Date().toISOString()
            },
            {
              label: "Old Wallet",
              address: "kre3w0i79j",
              balance: 0,
              names: 0,
              firstSeen: new Date().toISOString()
            },
            {
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

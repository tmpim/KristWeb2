import React, { Component, ReactNode } from "react";

import { withTranslation, WithTranslation } from "react-i18next";

import { ListView, HeaderSpec } from "@components/list-view/ListView";

import { IconButton } from "@components/icon-button/IconButton";
import Button from "react-bootstrap/Button";

import { SearchTextbox } from "@components/list-view/SearchTextbox";
import { FilterSelect } from "@components/list-view/FilterSelect";
import { DateString } from "@krist/types/KristTypes";

// TODO: Temporary
interface Wallet {
  label?: string;
  address: string;
  balance: number;
  names: number;
  category?: string;
  firstSeen?: DateString;
}

const WALLET_HEADERS = new Map<Extract<keyof Wallet, string>, HeaderSpec>()
  .set("label", { nameKey: "myWallets.columnLabel" })
  .set("address", { nameKey: "myWallets.columnAddress" })
  .set("balance", { nameKey: "myWallets.columnBalance" })
  .set("names", { nameKey: "myWallets.columnNames" })
  .set("category", { nameKey: "myWallets.columnCategory" })
  .set("firstSeen", { nameKey: "myWallets.columnFirstSeen" });

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
      headers={WALLET_HEADERS}
    />;
  }
}

export const MyWalletsPage = withTranslation()(MyWalletsPageComponent);

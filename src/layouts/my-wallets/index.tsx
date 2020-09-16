import React, { Component, ReactNode } from "react";

import { ListView, HeaderSpec } from "@components/list-view";

import { IconButton } from "@components/icon-button";
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
  .set("label", { name: "Label" })
  .set("address", { name: "Address" })
  .set("balance", { name: "Balance" })
  .set("names", { name: "Names" })
  .set("category", { name: "Category", sortable: false }) // TODO: temporary
  .set("firstSeen", { name: "First Seen" });

export class MyWalletsPage extends Component {
  render(): ReactNode {

    return <ListView<Wallet>
      title="23 wallets"
      page={1}
      pages={3}
      actions={<>
        <IconButton size="sm" variant="secondary" icon="database">
          Manage backups
        </IconButton>
        <IconButton size="sm" variant="success" icon="plus">
          Create wallet
        </IconButton>
        <Button size="sm" variant="outline-primary">
          {/* TODO: find an icon for this */}
          Add existing wallet
        </Button>
      </>}
      filters={<>
        {/* Search filter textbox */}
        <SearchTextbox placeholder="Search wallets..." />

        {/* Category selection box */}
        <FilterSelect 
          options={new Map()
            .set("_all", "All categories")
            .set("shops", "Shops")
          }
        />
      </>}
      headers={WALLET_HEADERS}
    />;
  }
}

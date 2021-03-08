// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo } from "react";
import classNames from "classnames";
import { AutoComplete } from "antd";

import { useTranslation, TFunction } from "react-i18next";

import { useWallets, Wallet, WalletMap } from "@wallets";

import { KristValue } from "@comp/krist/KristValue";

import "./AddressPicker.less";

interface Props {
  walletsOnly?: boolean;
  className?: string;
}

export function AddressPicker({ walletsOnly, className }: Props): JSX.Element {
  const { t } = useTranslation();

  const [value, setValue] = useState("");

  const { wallets } = useWallets();
  const options = useMemo(() => getOptions(t, wallets), [t, wallets]);

  const classes = classNames("address-picker", className, {
    "address-picker-wallets-only": walletsOnly
  });

  return <AutoComplete
    className={classes}
    dropdownClassName="address-picker-dropdown"

    placeholder={walletsOnly
      ? t("addressPicker.placeholderWalletsOnly")
      : t("addressPicker.placeholder")}

    allowClear

    filterOption={(inputValue, option) => {
      // Returning false if the option contains children will allow the select
      // to return _all_ children; no idea why.
      if (option?.options || !inputValue) return false;

      const inp = inputValue.toUpperCase();

      const address = option!.value;
      const walletLabel = option!["data-wallet-label"];

      const matchedAddress = address.toUpperCase().indexOf(inp) !== -1;
      const matchedLabel = walletLabel && walletLabel.toUpperCase().indexOf(inp) !== -1;

      return matchedAddress || matchedLabel;
    }}

    options={options}

    onChange={setValue}
    value={value}

    // TODO: remove this
    style={{ minWidth: 300 }}
  />;
}

function getCategoryHeader(category: string) {
  return {
    label: (
      <div className="address-picker-category-header">
        {category}
      </div>
    )
  };
}

interface AddressItemProps {
  address?: string;
  wallet?: Wallet;
}

interface OptionValue {
  label: React.ReactNode;

  // For some reason, all these props get passed all the way to the DOM element!
  // Make this a 'valid' DOM prop
  "data-wallet-label"?: string;
  value: string;
}
interface OptionChildren { label: React.ReactNode; options: OptionValue[] }
type Option = OptionValue | OptionChildren;
function getAddressItem({ address, wallet }: AddressItemProps): OptionValue {
  const plainAddress = wallet ? wallet.address : address;

  return {
    label: (
      <div className="address-picker-address-item">
        {/* Wallet label/address */}
        <div className="address-picker-item-content">
          {wallet && wallet.label
            ? <>
              <span className="address-picker-wallet-label">{wallet.label}&nbsp;</span>
              <span className="address-picker-wallet-address">({wallet.address})</span>
            </>
            : <span className="address-picker-address">{plainAddress}</span>}
        </div>

        {/* Wallet balance, if available */}
        {wallet && <KristValue hideNullish value={wallet.balance} />}
      </div>
    ),

    "data-wallet-label": wallet?.label,
    value: plainAddress!
  };
}

interface WalletOptions {
  categorised: Record<string, OptionValue[]>;
  uncategorised: OptionValue[];
  categoryCount: number;
}
function getWalletOptions(wallets: WalletMap): WalletOptions {
  const categorised: Record<string, OptionValue[]> = {};
  const uncategorised: OptionValue[] = [];

  for (const id in wallets) {
    const wallet = wallets[id];
    const { category } = wallet;
    const item = getAddressItem({ wallet });

    if (category) {
      if (categorised[category]) categorised[category].push(item);
      else categorised[category] = [item];
    } else {
      uncategorised.push(item);
    }
  }

  return {
    categorised,
    uncategorised,
    categoryCount: Object.keys(categorised).length
  };
}

function getOptions(t: TFunction, wallets: WalletMap): Option[] {
  const { categorised, uncategorised, categoryCount }
    = getWalletOptions(wallets);

  const sortedCategories = Object.keys(categorised);
  sortedCategories.sort((a, b) => a.localeCompare(b, undefined, {
    sensitivity: "base",
    numeric: true
  }));

  const categoryItems = sortedCategories.map(c => ({
    ...getCategoryHeader(c),
    options: categorised[c]
  }));

  return [
    // Categorised wallets
    ...categoryItems,

    // Uncategorised wallets
    {
      ...getCategoryHeader(categoryCount > 0
        ? t("addressPicker.categoryOtherWallets")
        : t("addressPicker.categoryWallets")),
      options: uncategorised
    }
  ];
}

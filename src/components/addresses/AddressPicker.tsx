// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo } from "react";
import classNames from "classnames";
import { AutoComplete } from "antd";

import { useTranslation, TFunction } from "react-i18next";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { useWallets, Wallet, WalletMap } from "@wallets";
import { isValidAddress } from "@utils/currency";

import { KristValue } from "@comp/krist/KristValue";

import "./AddressPicker.less";

interface Props {
  walletsOnly?: boolean;
  className?: string;
}

export function AddressPicker({ walletsOnly, className }: Props): JSX.Element {
  const { t } = useTranslation();

  const [value, setValue] = useState("");

  // Note that the address picker's options are memoised against the wallets
  // (and soon the address book too), but to save on time and expense, the
  // 'exact address' match is prepended to these options dynamically.
  const { wallets, addressList } = useWallets();
  const options = useMemo(() => getOptions(t, wallets), [t, wallets]);

  // Check if the input text is an exact address. If it is, create an extra item
  // to prepend to the list. Note that the 'exact address' item is NOT shown if
  // the picker wants wallets only, or if the exact address already appears as a
  // wallet (or later, an address book entry).
  const cleanValue = value.toLowerCase().trim();
  const addressPrefix = useSelector((s: RootState) => s.node.currency.address_prefix);
  const hasExactAddress = !walletsOnly
    && isValidAddress(addressPrefix, cleanValue)
    && !addressList.includes(cleanValue);
  const exactAddressItem = hasExactAddress
    ? {
      ...getCategoryHeader(t("addressPicker.categoryExactAddress")),
      options: [getAddressItem({ address: cleanValue })]
    }
    : undefined;

  const classes = classNames("address-picker", className, {
    "address-picker-wallets-only": walletsOnly,
    "address-picker-has-exact": hasExactAddress
  });

  // TODO: Wrap this in a Form.Item in advance? Every place I can think of off
  //       the top of my head will be using this in a form, so it might be good
  //       to provide some of the validation logic here.
  //       - Send Transaction Page (to/from) - Form
  //       - Receive Transaction Page (to) - Form
  //       - Name Purchase Page (owner) - Form
  //       - Name Transfer Page (to) - Form
  //       - Mining Page (to) - Possibly a form, can get away with making it one
  return <AutoComplete
    className={classes}
    dropdownClassName="address-picker-dropdown"

    // Change the placeholder to 'Choose a wallet' if this is for wallets only
    placeholder={walletsOnly
      ? t("addressPicker.placeholderWalletsOnly")
      : t("addressPicker.placeholder")}

    // Show a clear button on the input for convenience
    allowClear

    // Filter the options based on the input text
    filterOption={(inputValue, option) => {
      // Returning false if the option contains children will allow the select
      // to run filterOption for each child of that option group.
      if (option?.options || !inputValue) return false;
      // TODO: Do we want to filter categories here too?

      const inp = inputValue.toUpperCase();

      const address = option!.value;
      const walletLabel = option!["data-wallet-label"];

      const matchedAddress = address.toUpperCase().indexOf(inp) !== -1;
      const matchedLabel = walletLabel && walletLabel.toUpperCase().indexOf(inp) !== -1;

      return matchedAddress || matchedLabel;
    }}

    // Prepend the exact address item if it exists
    options={hasExactAddress && exactAddressItem
      ? [exactAddressItem, ...options]
      : options}

    onChange={setValue}
    value={value}

    // TODO: remove this
    style={{ minWidth: 300 }}
  />;
}

// Ant design's autocomplete/select/rc-select components don't seem to return
// the proper types for these, so just provide our own types that are 'good
// enough'. I have a feeling the AutoComplete/Select components just accept
// basically anything for options, and passes the full objects down as props.
// The documentation on the topic is very limited.
interface OptionValue {
  label: React.ReactNode;

  // For some reason, all these props get passed all the way to the DOM element!
  // Make this a 'valid' DOM prop
  "data-wallet-label"?: string;
  value: string;
}
interface OptionChildren { label: React.ReactNode; options: OptionValue[] }
type Option = OptionValue | OptionChildren;

function getCategoryHeader(category: string) {
  return {
    label: (
      <div className="address-picker-category-header">
        {category}
      </div>
    ),

    // Will possibly be used for filtering. See OptionValue for a comment on
    // the naming of this prop.
    "data-picker-category": category
  };
}

interface AddressItemProps {
  address?: string;
  wallet?: Wallet;
}

/** Autocompletion option for the address picker. */
function getAddressItem({ address, wallet }: AddressItemProps): OptionValue {
  // The address to use as a value, use the wallet if provided
  const plainAddress = wallet ? wallet.address : address;

  return {
    label: (
      <div className="address-picker-address-item">
        {/* Wallet label/address */}
        <div className="address-picker-item-content">
          {wallet && wallet.label
            ? <> {/* Show the label if possible: */}
              <span className="address-picker-wallet-label">{wallet.label}&nbsp;</span>
              <span className="address-picker-wallet-address">({wallet.address})</span>
            </> // Otherwise just show the address:
            : <span className="address-picker-address">{plainAddress}</span>}
        </div>

        {/* Wallet balance, if available */}
        {wallet && <KristValue hideNullish value={wallet.balance} />}
      </div>
    ),

    // The wallet label is used for filtering the options
    "data-wallet-label": wallet?.label,
    value: plainAddress!
  };
}

interface WalletOptions {
  categorised: Record<string, OptionValue[]>;
  uncategorised: OptionValue[];
  categoryCount: number;
}

/** Groups the wallets by category for autocompletion and generates their select
 * options. */
function getWalletOptions(wallets: WalletMap): WalletOptions {
  const categorised: Record<string, OptionValue[]> = {};
  const uncategorised: OptionValue[] = [];

  for (const id in wallets) {
    const wallet = wallets[id];
    const { category } = wallet;

    // Generate the autocomplete option for this wallet
    const item = getAddressItem({ wallet });

    // Group it by category if possible
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

/** Gets the base options to show for autocompletion, including the wallets,
 * grouped by category if possible. Will include the address book soon too. */
function getOptions(t: TFunction, wallets: WalletMap): Option[] {
  // Wallet options
  const { categorised, uncategorised, categoryCount }
    = getWalletOptions(wallets);

  // Sort the wallet categories in a human-friendly manner
  const sortedCategories = Object.keys(categorised);
  sortedCategories.sort((a, b) => a.localeCompare(b, undefined, {
    sensitivity: "base",
    numeric: true
  }));

  // Generate the option groups for each category, along with the corresponding
  // wallet entries.
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
    },

    // TODO: Address book
  ];
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { TFunction } from "react-i18next";

import { WalletMap, Wallet } from "@wallets";

import { getCategoryHeader } from "./Header";
import { getAddressItem } from "./Item";

import { keyedNullSort } from "@utils";

// Ant design's autocomplete/select/rc-select components don't seem to return
// the proper types for these, so just provide our own types that are 'good
// enough'. I have a feeling the AutoComplete/Select components just accept
// basically anything for options, and passes the full objects down as props.
// The documentation on the topic is very limited.
export interface OptionValue {
  label: React.ReactNode;

  // For some reason, all these props get passed all the way to the DOM element!
  // Make this a 'valid' DOM prop
  "data-wallet-label"?: string;
  "data-wallet"?: Wallet;
  value: string;
}

export interface OptionChildren {
  label: React.ReactNode;
  "data-picker-category": string;
  options: OptionValue[];
}

export type Option = OptionValue | OptionChildren;

// -----------------------------------------------------------------------------
// WALLET OPTIONS
// -----------------------------------------------------------------------------
interface WalletOptions {
  categorised: Record<string, OptionValue[]>;
  uncategorised: OptionValue[];
  categoryCount: number;
}

// Sort by balance descending, address ascending. Undefined values are pushed to
// the bottom by using keyedNullSort. Addresses are sorted ascending, though
// because of the implicit reversing behaviour of keyedNullSort, they need to
// be swapped here (i.e. sort with `b`, `a`).
const sortBalance = keyedNullSort<Wallet>("balance");
const sortAddress = keyedNullSort<Wallet>("address", true);
const sortFn = (a: Wallet, b: Wallet): number =>
  sortBalance(a, b, "descend") || sortAddress(b, a);
const optionSortFn = (a: OptionValue, b: OptionValue): number =>
  sortFn(a["data-wallet"]!, b["data-wallet"]!);

/** Groups the wallets by category for autocompletion and generates their select
 * options. */
function getWalletOptions(wallets: WalletMap): WalletOptions {
  const categorised: Record<string, OptionValue[]> = {};
  const uncategorised: OptionValue[] = [];

  // Go through all wallets and group them
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

  // Sort the wallets by balance descending, and then by address ascending.
  // Since this uses keyedNullSort, which depends on ant-design's implicit
  // reversing behaviour, the array is reversed after sorting here. As such,
  // undefined balances will be pushed to the bottom.
  for (const category in categorised) {
    categorised[category].sort(optionSortFn);
    categorised[category].reverse();
  }
  uncategorised.sort(optionSortFn);
  uncategorised.reverse();

  return {
    categorised,
    uncategorised,
    categoryCount: Object.keys(categorised).length
  };
}

// -----------------------------------------------------------------------------
// FULL OPTIONS
// -----------------------------------------------------------------------------
/** Gets the base options to show for autocompletion, including the wallets,
 * grouped by category if possible. Will include the address book soon too. */
export function getOptions(t: TFunction, wallets: WalletMap): Option[] {
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

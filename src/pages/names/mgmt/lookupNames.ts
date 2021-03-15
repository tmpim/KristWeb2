// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import {  notification } from "antd";

import { TFunction } from "react-i18next";

import { Wallet, WalletAddressMap } from "@wallets";
import { KristName } from "@api/types";
import { lookupNames } from "@api/lookup";

import { groupBy } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:name-picker");

export interface NameOptionGroup {
  key: string;
  label: string;
  wallet: Wallet;
  names: NameOption[];
}

export interface NameOption {
  key: string;
  value: string;
  name: string;
  owner: string;
}

export function getNameOptions(
  nameSuffix: string,
  wallet: Wallet,
  names: KristName[]
): NameOptionGroup {
  // Group by owning wallet
  return {
    key: wallet.address,
    label: wallet.label || wallet.address,
    wallet,

    // Each individual name
    names: names.map(name => ({
      key: name.name,
      value: name.name,
      name: name.name + "." + nameSuffix,
      owner: name.owner
    }))
  };
}

export async function fetchNames(
  t: TFunction,
  nameSuffix: string,
  wallets: WalletAddressMap
): Promise<NameOptionGroup[] | null> {
  debug("performing name fetch");

  try {
    // Get the full list of names for the given wallets.
    const addresses = Object.keys(wallets);
    const { names, total } = await lookupNames(addresses, {
      orderBy: "name", order: "ASC",
      limit: 1000 // TODO: support more than 1000
    });

    // Since more than 1000 isn't supported yet, show a warning
    if (total > 1000)
      notification.warning({ message: t("namePicker.warningTotalLimit") });

    // Group the names into OptGroups per wallet.
    const options = Object.entries(groupBy(names, n => n.owner))
      .map(([address, group]) =>
        getNameOptions(nameSuffix, wallets[address], group));

    debug("got names:", names, options);
    return options;
  } catch (err) {
    notification.error({
      message: t("error"),
      description: t("namePicker.errorLookup")
    });
    return null;
  }
}

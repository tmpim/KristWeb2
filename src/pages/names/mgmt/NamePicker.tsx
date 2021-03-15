// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { Select, notification } from "antd";

import { useTranslation, TFunction } from "react-i18next";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { Wallet, WalletAddressMap, useWallets } from "@wallets";
import { KristName } from "@api/types";
import { lookupNames } from "@api/lookup";

import { useNameSuffix } from "@utils/currency";

import { throttle, groupBy } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:name-picker");

const FETCH_THROTTLE = 500;

async function _fetchNames(
  t: TFunction,
  nameSuffix: string,
  wallets: WalletAddressMap,
  setOptions: Dispatch<SetStateAction<JSX.Element[] | null>>
): Promise<void> {
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
        getNameOptions(nameSuffix, wallets[address], group))

    debug("got names:", names, options);
    setOptions(options);
  } catch (err) {
    setOptions(null);
    notification.error({
      message: t("error"),
      description: t("namePicker.errorLookup")
    });
  }
}

function getNameOptions(
  nameSuffix: string,
  wallet: Wallet,
  names: KristName[]
): JSX.Element {
  const groupLabel = wallet.label || wallet.address;

  // Group by owning wallet
  return <Select.OptGroup key={wallet.address} label={groupLabel}>
    {/* Each individual name */}
    {names.map(name => (
      <Select.Option
        key={name.name}
        value={name.name}
        data-name={name.name + "." + nameSuffix}
      >
        {name.name}.{nameSuffix}
      </Select.Option>
    ))}
  </Select.OptGroup>
}

export function NamePicker(): JSX.Element {
  const { t } = useTranslation();

  // Used to fetch the list of available names
  const { walletAddressMap, joinedAddressList } = useWallets();
  const fetchNames = useMemo(() =>
    throttle(_fetchNames, FETCH_THROTTLE, { leading: true }), []);
  const nameSuffix = useNameSuffix();

  // Used for auto-refreshing the names if they happen to update
  const refreshID = useSelector((s: RootState) => s.node.lastOwnNameTransactionID);

  const [nameOptions, setNameOptions] = useState<JSX.Element[] | null>(null);

  // Fetch the name list on mount/when the address list changes, or when one of
  // our wallets receives a name transaction.
  useEffect(() => {
    debug(
      "addressList updated (%s, %s, %d)",
      joinedAddressList, nameSuffix, refreshID
    );

    fetchNames(t, nameSuffix, walletAddressMap, setNameOptions);
  }, [joinedAddressList, nameSuffix, refreshID]);

  // TODO: wrap this in a Form.Item
  return <Select
    showSearch
    placeholder={t("namePicker.placeholder")}

    loading={!nameOptions}

    style={{ width: 300 }}

    // Filter by name with suffix case insensitively
    filterOption={(input, option) => {
      // Display all groups
      if (option?.options) return false;

      const name = option?.["data-name"] || option?.value;
      if (!name) return false;

      return name.toUpperCase().indexOf(input.toUpperCase()) >= 0;
    }}
  >
    {nameOptions}
  </Select>
}

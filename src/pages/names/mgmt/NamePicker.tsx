// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import {
  useState, useEffect, useMemo, Dispatch, SetStateAction, Ref
} from "react";
import { Select, Form, Input, Button, notification } from "antd";
import { RefSelectProps } from "antd/lib/select";

import { useTranslation, TFunction } from "react-i18next";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { Wallet, WalletAddressMap, useWallets } from "@wallets";
import { KristName } from "@api/types";
import { lookupNames } from "@api/lookup";

import { useNameSuffix } from "@utils/currency";
import shallowEqual from "shallowequal";

import { throttle, groupBy } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:name-picker");

const FETCH_THROTTLE = 500;

async function _fetchNames(
  t: TFunction,
  nameSuffix: string,
  wallets: WalletAddressMap,
  setOptions: Dispatch<SetStateAction<NameOptionGroup[] | null>>
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
        getNameOptions(nameSuffix, wallets[address], group));

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

interface Props {
  formName: string;
  label?: string;
  tabIndex?: number;

  value?: string[];
  setValue?: (value: string[]) => void;

  filterOwner?: string;

  multiple?: boolean;
  allowAll?: boolean;

  inputRef?: Ref<RefSelectProps>;
}

export function NamePicker({
  formName,
  label,
  tabIndex,

  value,
  setValue,

  filterOwner,

  multiple,
  allowAll,

  inputRef,
  ...props
}: Props): JSX.Element {
  const { t } = useTranslation();

  // Used to fetch the list of available names
  const { walletAddressMap, joinedAddressList } = useWallets();
  const fetchNames = useMemo(() =>
    throttle(_fetchNames, FETCH_THROTTLE, { leading: true }), []);
  const nameSuffix = useNameSuffix();

  // The actual list of available names (pre-filtered, not rendered yet)
  const [nameOptions, setNameOptions]
    = useState<NameOptionGroup[] | null>(null);
  const [filteredOptions, setFilteredOptions]
    = useState<JSX.Element[] | null>(null);

  // Used for auto-refreshing the names if they happen to update
  const refreshID = useSelector((s: RootState) => s.node.lastOwnNameTransactionID);

  // Whether or not to show the 'All' button for bulk name management. On by
  // default.
  const showAllButton = allowAll !== false && multiple !== false;

  // Fetch the name list on mount/when the address list changes, or when one of
  // our wallets receives a name transaction.
  useEffect(() => {
    debug(
      "addressList updated (%s, %s, %d)",
      joinedAddressList, nameSuffix, refreshID
    );

    fetchNames(t, nameSuffix, walletAddressMap, setNameOptions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNames, t, nameSuffix, refreshID, joinedAddressList]);

  // If passed an address, filter out that address from the results. Used to
  // prevent sending names to the existing owner. Renders the name options.
  useEffect(() => {
    if (!nameOptions) {
      setFilteredOptions(null);
      return;
    }

    const filteredGroups = nameOptions
      .filter(group => filterOwner ? group.key !== filterOwner : true);

    // If there are any invalid names in the form value, remove them here
    if (value && setValue) {
      // Convert the available names to a lookup table
      const filteredNames = filteredGroups
        .flatMap(g => g.names)
        .reduce((out, o) => {
          out[o.key] = true;
          return out;
        }, {} as Record<string, boolean>);

      // Remove any names in the value that aren't in the lookup table
      const newValue = value?.filter(v => !!filteredNames[v]);
      const equal = shallowEqual(value, newValue);

      debug(
        "updating value (filterOwner: %s) to %o (equal: %b)",
        filterOwner, newValue, equal
      );

      // If the values are different, set the new one
      if (!equal) setValue(newValue);
    }

    setFilteredOptions(filteredGroups.map(renderNameOptions));
  }, [nameOptions, filterOwner, value, setValue]);

  // Select all available names
  function selectAll() {
    if (!nameOptions || !setValue) return;

    // Filter out names from filterOwner if applicable
    const filteredGroups = nameOptions
      .filter(group => filterOwner ? group.key !== filterOwner : true);
    const names = filteredGroups
      .flatMap(g => g.names)
      .map(n => n.value);

    setValue(names);
  }

  return <Form.Item
    label={label}
    required
    {...props}
  >
    <Input.Group compact style={{ display: "flex" }}>
      {/* Name select */}
      <Form.Item
        name={formName}
        style={{ flex: 1, marginBottom: 0 }}

        validateFirst
        rules={[
          { required: true, message: t("nameTransfer.errorNameRequired") }
        ]}
      >
        <Select
          showSearch
          placeholder={multiple !== false
            ? t("namePicker.placeholderMultiple")
            : t("namePicker.placeholder")}

          style={{ width: "100%" }}

          allowClear
          mode={multiple !== false ? "multiple" : undefined}
          maxTagCount={5}

          loading={!nameOptions}

          // Filter by name with suffix case insensitively
          filterOption={(input, option) => {
            // Display all groups
            if (option?.options) return false;

            const name = option?.["data-name"] || option?.value;
            if (!name) return false;

            return name.toUpperCase().indexOf(input.toUpperCase()) >= 0;
          }}

          ref={inputRef}
          tabIndex={tabIndex}
        >
          {filteredOptions}
        </Select>
      </Form.Item>

      {/* "All" button */}
      {showAllButton && <div>
        <Button onClick={selectAll} >
          {t("namePicker.buttonAll")}
        </Button>
      </div>}
    </Input.Group>
  </Form.Item>;
}

interface NameOptionGroup {
  key: string;
  label: string;
  names: NameOption[];
}

interface NameOption {
  key: string;
  value: string;
  name: string;
}

function getNameOptions(
  nameSuffix: string,
  wallet: Wallet,
  names: KristName[]
): NameOptionGroup {
  // Group by owning wallet
  return {
    key: wallet.address,
    label: wallet.label || wallet.address,

    // Each individual name
    names: names.map(name => ({
      key: name.name,
      value: name.name,
      name: name.name + "." + nameSuffix
    }))
  };
}

function renderNameOptions(group: NameOptionGroup): JSX.Element {
  // Group by owning wallet
  return <Select.OptGroup key={group.key} label={group.label}>
    {/* Each individual name */}
    {group.names.map(name => (
      <Select.Option
        key={name.key}
        value={name.value}
        data-name={name.name}
      >
        {name.name}
      </Select.Option>
    ))}
  </Select.OptGroup>;
}

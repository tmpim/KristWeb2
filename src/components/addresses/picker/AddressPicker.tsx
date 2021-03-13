// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo, Ref } from "react";
import classNames from "classnames";
import { AutoComplete, Form } from "antd";
import { Rule } from "antd/lib/form";
import { RefSelectProps } from "antd/lib/select";

import { useTranslation } from "react-i18next";

import { useWallets } from "@wallets";
import {
  useAddressPrefix, useNameSuffix,
  isValidAddress, getNameParts,
  getNameRegex, getAddressRegexV2
} from "@utils/currency";

import { getCategoryHeader } from "./Header";
import { getAddressItem } from "./Item";
import { getOptions } from "./options";
import { usePickerHints } from "./PickerHints";

import "./AddressPicker.less";

interface Props {
  name: string;
  label?: string;
  value?: string;
  otherPickerValue?: string;

  walletsOnly?: boolean;
  noNames?: boolean;
  nameHint?: boolean;

  className?: string;
  tabIndex?: number;
  inputRef?: Ref<RefSelectProps>;
}

export function AddressPicker({
  name,
  label,
  value,
  otherPickerValue,

  walletsOnly,
  noNames,
  nameHint,

  className,
  tabIndex,
  inputRef,
  ...props
}: Props): JSX.Element {
  const { t } = useTranslation();

  const cleanValue = value?.toLowerCase().trim();

  // Note that the address picker's options are memoised against the wallets
  // (and soon the address book too), but to save on time and expense, the
  // 'exact address' match is prepended to these options dynamically.
  const { wallets, addressList } = useWallets();
  const options = useMemo(() => getOptions(t, wallets), [t, wallets]);

  // Check if the input text is an exact address. If it is, create an extra item
  // to prepend to the list. Note that the 'exact address' item is NOT shown if
  // the picker wants wallets only, or if the exact address already appears as a
  // wallet (or later, an address book entry).
  const addressPrefix = useAddressPrefix();
  const hasExactAddress = !!cleanValue
    && !walletsOnly
    && isValidAddress(addressPrefix, cleanValue)
    && !addressList.includes(cleanValue);
  const exactAddressItem = hasExactAddress
    ? {
      ...getCategoryHeader(t("addressPicker.categoryExactAddress")),
      options: [getAddressItem({ address: cleanValue })]
    }
    : undefined;

  // Check if the input text is an exact name. It may begin with a metaname, but
  // must end with the name suffix.
  const nameSuffix = useNameSuffix();
  const nameParts = !walletsOnly && !noNames
    ? getNameParts(nameSuffix, cleanValue) : undefined;
  const hasExactName = !!cleanValue
    && !walletsOnly
    && !noNames
    && !!nameParts?.name;
  const exactNameItem = hasExactName
    ? {
      ...getCategoryHeader(t("addressPicker.categoryExactName")),
      options: [getAddressItem({ name: nameParts })]
    }
    : undefined;

  // Shallow copy the options if we need to prepend anything, otherwise use the
  // original memoised array. Prepend the exact address or exact name if they
  // are available.
  const fullOptions = hasExactAddress || hasExactName
    ? [
      ...(exactAddressItem ? [exactAddressItem] : []),
      ...(exactNameItem ? [exactNameItem] : []),
      ...options
    ]
    : options;

  // Fetch an address or name hint if possible
  const pickerHints = usePickerHints(nameHint, cleanValue, hasExactName);

  const classes = classNames("address-picker", className, {
    "address-picker-wallets-only": walletsOnly,
    "address-picker-no-names": noNames,
    "address-picker-has-exact-address": hasExactAddress,
    "address-picker-has-exact-name": hasExactName,
  });

  return <div className={classes}>
    <Form.Item
      name={name}
      label={label}

      // This stops the 'Wallet is invalid' rule from showing twice e.g. for a
      // blank input
      validateFirst

      rules={[
        { required: true, message: walletsOnly
          ? t("addressPicker.errorWalletRequired")
          : t("addressPicker.errorRecipientRequired")},

        // Address/name regexp
        {
          type: "method",
          async validator(_, value): Promise<void> {
            const addressRegexp = getAddressRegexV2(addressPrefix);

            if (walletsOnly || noNames) {
              // Only validate with addresses
              if (!addressRegexp.test(value)) {
                if (walletsOnly)
                  throw t("addressPicker.errorInvalidWalletsOnly");
                else throw t("addressPicker.errorInvalidAddressOnly");
              }
            } else {
              // Validate addresses and names
              const nameRegexp = getNameRegex(nameSuffix);
              if (!addressRegexp.test(value) && !nameRegexp.test(value))
                throw t("addressPicker.errorInvalidRecipient");
            }
          }
        },

        // If this is walletsOnly, add an additional rule to enforce that the
        // given address is a wallet we actually own
        ...(walletsOnly ? [{
          type: "enum",
          enum: addressList,
          message: t("addressPicker.errorInvalidWalletsOnly")
        } as Rule] : []),

        // If we have another address picker's value, assert that they are not
        // equal (e.g. to/from in a transaction can't be equal)
        ...(otherPickerValue ? [{
          async validator(_, value): Promise<void> {
            if (value === otherPickerValue)
              throw t("addressPicker.errorEqual");
          }
        } as Rule] : [])
      ]}

      {...props}
    >
      <AutoComplete
        ref={inputRef}

        dropdownClassName="address-picker-dropdown"
        dropdownMatchSelectWidth={false}

        // Change the placeholder to 'Choose a wallet' if applicable
        placeholder={walletsOnly
          ? t("addressPicker.placeholderWalletsOnly")
          : t("addressPicker.placeholder")}

        // Show a clear button on the input for convenience
        allowClear

        // Filter the options based on the input text
        filterOption={(inputValue, option) => {
          // Returning false if the option contains children will allow the
          // select to run filterOption for each child of that option group.
          if (option?.options) return false;
          // TODO: Do we want to filter categories here too?

          const address = option!.value?.toUpperCase();
          const walletLabel = option!["data-wallet-label"]?.toUpperCase();

          // If we have another address picker's value, hide that option from
          // the list (it will always be a wallet)
          // FIXME: filterOption doesn't get called at all when inputValue is
          //        blank, which means this option will still appear until the
          //        user actually starts typing.
          if (otherPickerValue?.toUpperCase() === address)
            return false;

          // Now that we've filtered out the other picker's value, we can allow
          // every other option if there's no input
          if (!inputValue) return true;

          const inp = inputValue.toUpperCase();

          const matchedAddress = address.indexOf(inp) !== -1;
          const matchedLabel = walletLabel?.indexOf(inp) !== -1;

          return matchedAddress || matchedLabel;
        }}

        options={fullOptions}

        tabIndex={tabIndex}
      />
    </Form.Item>

    {/* Show the address/name hints if they are present */}
    {pickerHints}
  </div>;
}


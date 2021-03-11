// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useMemo } from "react";

import {
  isValidAddress, stripNameSuffix,
  useAddressPrefix, useNameSuffix
} from "@utils/currency";

import * as api from "@api";
import { KristAddressWithNames, lookupAddress } from "@api/lookup";
import { KristName } from "@api/types";

import { AddressHint } from "./AddressHint";
import { NameHint } from "./NameHint";

import { debounce } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:address-picker-hints");

const HINT_LOOKUP_DEBOUNCE = 250;

export function usePickerHints(
  nameHint?: boolean,
  value?: string,
  hasExactName?: boolean
): JSX.Element | null {
  const addressPrefix = useAddressPrefix();
  const nameSuffix = useNameSuffix();

  // Handle showing an address or name hint if the value is valid
  const [foundAddress, setFoundAddress] = useState<KristAddressWithNames | false | undefined>();
  const [foundName, setFoundName] = useState<KristName | false | undefined>();

  const lookupHint = useMemo(() => debounce((
    nameSuffix: string,
    value: string,
    hasAddress?: boolean,
    hasName?: boolean,
    nameHint?: boolean
  ) => {
    debug("looking up hint for %s (address: %b) (name: %b)",
      value, hasAddress, hasName);

    if (hasAddress) {
      // Lookup an address
      setFoundName(undefined);
      lookupAddress(value, nameHint)
        .then(setFoundAddress)
        .catch(() => setFoundAddress(false));
    } else if (hasName) {
      // Lookup a name
      setFoundAddress(undefined);

      const rawName = stripNameSuffix(nameSuffix, value);

      api.get<{ name: KristName }>("names/" + encodeURIComponent(rawName))
        .then(res => setFoundName(res.name))
        .catch(() => setFoundName(false));
    }
  }, HINT_LOOKUP_DEBOUNCE), []);

  // Look up the address/name if it is valid (debounced to 250ms)
  useEffect(() => {
    if (!value) {
      setFoundAddress(undefined);
      setFoundName(undefined);
      return;
    }

    // hasExactAddress fails for walletsOnly, so use this variant instead
    const hasValidAddress = !!value
      && isValidAddress(addressPrefix, value);

    if (!hasValidAddress && !hasExactName) {
      setFoundAddress(undefined);
      setFoundName(undefined);
      return;
    }

    // Perform the lookup (debounced)
    lookupHint(nameSuffix, value, hasValidAddress, hasExactName, nameHint);
  }, [lookupHint, nameSuffix, value, addressPrefix, hasExactName, nameHint]);

  // Return an address hint if possible
  if (foundAddress !== undefined) return (
    <AddressHint address={foundAddress || undefined} nameHint={nameHint} />
  );

  // Return a name hint if possible
  if (foundName !== undefined) return (
    <NameHint name={foundName || undefined} />
  );

  return null;
}

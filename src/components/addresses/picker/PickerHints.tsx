// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useMemo, useRef } from "react";

import {
  isValidAddress, getNameParts,
  useAddressPrefix, useNameSuffix
} from "@utils/currency";
import { useWallets } from "@wallets";

import * as api from "@api";
import { KristAddressWithNames, lookupAddress } from "@api/lookup";
import { KristName } from "@api/types";

import { WalletHint } from "./WalletHint";
import { VerifiedHint } from "./VerifiedHint";
import { AddressHint } from "./AddressHint";
import { NameHint } from "./NameHint";

import { getVerified } from "@comp/addresses/VerifiedAddress";
import { useSubscription } from "@global/ws/WebsocketSubscription";

import { debounce } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:address-picker-hints");

const HINT_LOOKUP_DEBOUNCE = 250;

interface PickerHintsRes {
  pickerHints: JSX.Element | null;
  foundAddress?: KristAddressWithNames | false;
  foundName?: KristName | false;
}

export function usePickerHints(
  nameHint?: boolean,
  value?: string,
  hasExactName?: boolean,
  suppressUpdates?: boolean
): PickerHintsRes {
  debug("using picker hints for %s", value);

  // Used for clean-up
  const isMounted = useRef(true);

  const addressPrefix = useAddressPrefix();
  const nameSuffix = useNameSuffix();

  // Handle showing an address or name hint if the value is valid
  const [foundAddress, setFoundAddress] = useState<KristAddressWithNames | false | undefined>();
  const [foundName, setFoundName] = useState<KristName | false | undefined>();

  // To auto-refresh address balances, we need to subscribe to the address.
  // This is the address to subscribe to:
  const [validAddress, setValidAddress] = useState<string>();
  const lastTransactionID = useSubscription({ address: validAddress });

  // Used to show a wallet hint
  const { walletAddressMap, joinedAddressList } = useWallets();
  const foundWallet = validAddress && value
    ? walletAddressMap[validAddress] : undefined;

  // Used to show a verified hint
  const foundVerified = validAddress ? getVerified(validAddress) : undefined;

  // The actual lookup function (debounced)
  const lookupHint = useMemo(() => debounce(async (
    nameSuffix: string,
    value: string,
    hasAddress?: boolean,
    hasName?: boolean,
    nameHint?: boolean
  ) => {
    // Skip doing anything when unmounted to avoid illegal state updates
    if (!isMounted.current) return debug("unmounted skipped lookupHint");

    debug("looking up hint for %s (address: %b) (name: %b)",
      value, hasAddress, hasName);

    if (hasAddress) {
      // Lookup an address
      setFoundName(undefined);

      try {
        const address = await lookupAddress(value, nameHint);

        if (!isMounted.current)
          return debug("unmounted skipped lookupHint hasAddress try");
        setFoundAddress(address);
      } catch (ignored) {
        if (!isMounted.current)
          return debug("unmounted skipped lookupHint hasAddress catch");
        setFoundAddress(false);
      }
    } else if (hasName) {
      // Lookup a name
      setFoundAddress(undefined);

      try {
        const nameParts = getNameParts(nameSuffix, value);
        const res = await api.get<{ name: KristName }>(
          "names/" + encodeURIComponent(nameParts!.name!)
        );

        if (!isMounted.current)
          return debug("unmounted skipped lookupHint hasName try");
        setFoundName(res.name);
      } catch (ignored) {
        if (!isMounted.current)
          return debug("unmounted skipped lookupHint hasName catch");
        setFoundName(false);
      }
    }
  }, HINT_LOOKUP_DEBOUNCE), []);

  // Look up the address/name if it is valid (debounced to 250ms)
  useEffect(() => {
    // Skip doing anything when unmounted to avoid illegal state updates
    if (!isMounted.current) return debug("unmounted skipped lookup useEffect");
    if (suppressUpdates) return debug("picker hint lookup check suppressed");

    if (!value) {
      setFoundAddress(undefined);
      setFoundName(undefined);
      setValidAddress(undefined);
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

    // Update the subscription if necessary
    if (hasValidAddress && validAddress !== value) {
      debug("updating valid address from %s to %s", validAddress, value);
      setValidAddress(value);
    }

    // Perform the lookup (debounced)
    lookupHint(nameSuffix, value, hasValidAddress, hasExactName, nameHint);
  }, [
    lookupHint, nameSuffix, value, addressPrefix, hasExactName, nameHint,
    validAddress, lastTransactionID, joinedAddressList, suppressUpdates
  ]);

  // Clean up the debounced function when unmounting
  useEffect(() => {
    isMounted.current = true;

    return () => {
      debug("unmounting address picker hint");
      isMounted.current = false;
      lookupHint?.cancel();
    };
  }, [lookupHint]);

  // Whether or not to show certain hints/anything at all
  const showWalletHint = !!foundWallet;
  const showVerifiedHint = !!foundVerified && !showWalletHint;
  const showAddressHint = foundAddress !== undefined;
  const showNameHint = foundName !== undefined;
  const foundAnything = showWalletHint || showVerifiedHint
    || showAddressHint || showNameHint;

  // Whether or not to show a separator between the wallet hint and address or
  // name hint (i.e. if two hints are shown)
  const showSep = (showWalletHint || showVerifiedHint)
    && (showAddressHint || showNameHint);

  const pickerHints = foundAnything
    ? <div className="address-picker-hints">
      {/* Show a wallet hint if possible */}
      {foundWallet && <WalletHint wallet={foundWallet} />}

      {/* Show a verified hint if possible */}
      {foundVerified && (
        // Make it look like a contextual address to inherit the styles
        <span className="contextual-address">
          <VerifiedHint address={validAddress!} verified={foundVerified} />
        </span>
      )}

      {/* Show a separator if there are two hints */}
      {showSep && <span className="address-picker-separator">&ndash;</span>}

      {/* Show an address hint if possible */}
      {showAddressHint && (
        <AddressHint address={foundAddress || undefined} nameHint={nameHint} />
      )}

      {/* Show a name hint if possible */}
      {showNameHint && <NameHint name={foundName || undefined} />}
    </div>
    : null;

  return { pickerHints, foundAddress, foundName };
}

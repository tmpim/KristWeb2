// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useSelector } from "react-redux";
import { RootState } from "@store";

import { memoize, escapeRegExp, truncate, toString } from "lodash-es";

// -----------------------------------------------------------------------------
// NAMES
// -----------------------------------------------------------------------------
// Cheap way to avoid RegExp DoS
const MAX_NAME_SUFFIX_LENGTH = 6;
const _cleanNameSuffix = (nameSuffix: string | undefined | null): string => {
  // Ensure the name suffix is safe to put into a RegExp
  const stringSuffix = toString(nameSuffix);
  const shortSuffix = truncate(stringSuffix, { length: MAX_NAME_SUFFIX_LENGTH, omission: "" });
  const escaped = escapeRegExp(shortSuffix);
  return escaped;
};
export const cleanNameSuffix = memoize(_cleanNameSuffix);

const _getNameRegex = (nameSuffix: string | undefined | null, metadata?: boolean): RegExp =>
  new RegExp(`^(?:([a-z0-9-_]{1,32})@)?([a-z0-9]{1,64})(\\.${cleanNameSuffix(nameSuffix)})${metadata ? ";?" : "$"}`);
export const getNameRegex = memoize(_getNameRegex);

export interface NameParts {
  metaname?: string;
  name?: string;
  nameSuffix?: string;
  nameWithSuffix?: string;
  recipient?: string;
}
export function getNameParts(
  nameSuffix: string | undefined | null,
  name: string | undefined
): NameParts | undefined {
  if (!nameSuffix || !name) return;

  const nameMatches = getNameRegex(nameSuffix).exec(name);
  if (!nameMatches) return undefined;

  const mMetaname = nameMatches[1] || undefined;
  const mName = nameMatches[2] || undefined;
  const nameWithSuffix = mName ? mName + "." + nameSuffix : undefined;
  const recipient = mMetaname
    ? mMetaname + "@" + nameWithSuffix
    : nameWithSuffix;

  return {
    metaname: mMetaname,
    name: mName,
    nameSuffix,
    nameWithSuffix,
    recipient
  };
}

const _stripNameSuffixRegExp = (nameSuffix: string | undefined | null): RegExp =>
  new RegExp(`\\.${cleanNameSuffix(nameSuffix)}$`);
export const stripNameSuffixRegExp = memoize(_stripNameSuffixRegExp);

export const stripNameSuffix = (nameSuffix: string | undefined | null, inp: string): string =>
  inp.replace(stripNameSuffixRegExp(nameSuffix), "");

export const stripNameFromMetadata = (nameSuffix: string | undefined | null, metadata: string): string =>
  metadata.replace(getNameRegex(nameSuffix, true), "");

// -----------------------------------------------------------------------------
// ADDRESSES
// -----------------------------------------------------------------------------
const MAX_ADDRESS_PREFIX_LENGTH = 1;
const _cleanAddressPrefix = (addressPrefix: string | undefined | null): string => {
  // This might be slightly cursed when the max prefix length is 1 character,
  // but let's call it future-proofing.
  const stringPrefix = toString(addressPrefix);
  const shortPrefix = truncate(stringPrefix, { length: MAX_ADDRESS_PREFIX_LENGTH, omission: "" });
  const escaped = escapeRegExp(shortPrefix);
  return escaped;
};
export const cleanAddressPrefix = memoize(_cleanAddressPrefix);

// Supports v1 addresses too
const _getAddressRegex = (addressPrefix: string | undefined | null): RegExp =>
  new RegExp(`^(?:${cleanAddressPrefix(addressPrefix)}[a-z0-9]{9}|[a-f0-9]{10})$`);
export const getAddressRegex = memoize(_getAddressRegex);

// Only supports v2 addresses
const _getAddressRegexV2 = (addressPrefix: string | undefined | null): RegExp =>
  new RegExp(`^${cleanAddressPrefix(addressPrefix)}[a-z0-9]{9}$`);
export const getAddressRegexV2 = memoize(_getAddressRegexV2);

/**
 * Returns whether or not an address is a valid Krist address for the current
 * sync node.
 *
 * @param addressPrefix - The single-character address prefix provided by the
 *   sync node.
 * @param address - The address to check for validity.
 * @param allowV1 - Whether or not the function should validate v1 addresses.
 *   Note that as of February 2021, the Krist server no longer accepts
 *   any kind of transaction to/from a v1 address, so features that are
 *   validating an address for purpose of a transaction (e.g. the address
 *   picker) should NOT set this to true.
 */
export function isValidAddress(
  addressPrefix: string | undefined | null,
  address: string,
  allowV1?: boolean
): boolean {
  return allowV1
    ? getAddressRegex(addressPrefix).test(address)
    : getAddressRegexV2(addressPrefix).test(address);
}


// -----------------------------------------------------------------------------
// MISC
// -----------------------------------------------------------------------------

/**
 * Estimates the network mining hash-rate, returning it as a formatted string.
 *
 * TODO: Some people claimed they had a more accurate function for this. PRs
 *   welcome!
 *
 * @param work - The current block difficulty.
 * @param secondsPerBlock - The number of seconds per block, as per the sync
 *   node's configuration.
*/
export function estimateHashRate(work: number, secondsPerBlock: number): string {
  // Identical to the function from KristWeb 1
  const rate = 1 / (work / (Math.pow(256, 6)) * secondsPerBlock);
  if (rate === 0) return "0 H/s";

  const sizes = ["H", "KH", "MH", "GH", "TH"];
  const i = Math.min(Math.floor(Math.log(rate) / Math.log(1000)), sizes.length);
  return parseFloat((rate / Math.pow(1000, i)).toFixed(2)) + " " + sizes[i] + "/s";
}

/** Hook to get the address prefix. */
export const useAddressPrefix = (): string =>
  useSelector((s: RootState) => s.node.currency.address_prefix);

/** Hook to get the name suffix. */
export const useNameSuffix = (): string =>
  useSelector((s: RootState) => s.node.currency.name_suffix);

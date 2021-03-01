// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { memoize, escapeRegExp, truncate, toString } from "lodash-es";

const _cleanNameSuffix = (nameSuffix: string | undefined | null): string => {
  // Ensure the name suffix is safe to put into a RegExp
  const stringSuffix = toString(nameSuffix);
  const shortSuffix = truncate(stringSuffix, { length: MAX_NAME_SUFFIX_LENGTH, omission: "" });
  const escaped = escapeRegExp(shortSuffix);
  return escaped;
};
export const cleanNameSuffix = memoize(_cleanNameSuffix);

// Cheap way to avoid RegExp DoS
const MAX_NAME_SUFFIX_LENGTH = 6;
const _getNameRegex = (nameSuffix: string | undefined | null, metadata?: boolean): RegExp =>
  new RegExp(`^(?:([a-z0-9-_]{1,32})@)?([a-z0-9]{1,64}\\.${cleanNameSuffix(nameSuffix)})${metadata ? ";?" : "$"}`);
export const getNameRegex = memoize(_getNameRegex);

const _stripNameSuffixRegExp = (nameSuffix: string | undefined | null): RegExp =>
  new RegExp(`\\.${cleanNameSuffix(nameSuffix)}$`);
export const stripNameSuffixRegExp = memoize(_stripNameSuffixRegExp);

export const stripNameSuffix = (nameSuffix: string | undefined | null, inp: string): string =>
  inp.replace(stripNameSuffixRegExp(nameSuffix), "");

export const stripNameFromMetadata = (nameSuffix: string | undefined | null, metadata: string): string =>
  metadata.replace(getNameRegex(nameSuffix, true), "");

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

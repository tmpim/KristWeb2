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
const _getNameRegex = (nameSuffix: string | undefined | null): RegExp =>
  new RegExp(`^(?:([a-z0-9-_]{1,32})@)?([a-z0-9]{1,64}\\.${cleanNameSuffix(nameSuffix)})$`);
export const getNameRegex = memoize(_getNameRegex);

const _stripNameSuffixRegExp = (nameSuffix: string | undefined | null): RegExp =>
  new RegExp(`\\.${cleanNameSuffix(nameSuffix)}$`);
export const stripNameSuffixRegExp = memoize(_stripNameSuffixRegExp);

export const stripNameSuffix = (nameSuffix: string | undefined | null, inp: string): string =>
  inp.replace(stripNameSuffixRegExp(nameSuffix), "");

import { EffectCallback, useEffect } from "react";

export const toHex = (input: ArrayBufferLike | Uint8Array): string =>
  [...(input instanceof Uint8Array ? input : new Uint8Array(input))]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

export const fromHex = (input: string): Uint8Array =>
  new Uint8Array((input.match(/.{1,2}/g) || []).map(b => parseInt(b, 16)));

export const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

/**
 * Generates a secure random password based on a length and character set.
 *
 * Implementation mostly sourced from: {@link https://stackoverflow.com/a/51540480/1499974}
 *
 * See also: {@link https://github.com/chancejs/chancejs/issues/232#issuecomment-182500222}
 *
 * @param length - The desired length of the password.
 * @param charset - A string containing all the characters the password may
 *   contain.
*/
export function generatePassword(
  length = 32,
  charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-"
): string {
  // NOTE: talk about correctness with modulo and its bias (the charset is 64
  //       characters right now anyway)
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map(x => charset[x % charset.length])
    .join("");
}

/** Sort an array in-place in a human-friendly manner. */
export function localeSort(arr: any[]): void {
  arr.sort((a, b) => a.localeCompare(b, undefined, {
    sensitivity: "base",
    numeric: true
  }));
}

/**
 * Sorting function that pushes nullish to the end of the array.
 *
 * @param key - The property of T to sort by.
 * @param human - Whether or not to use a human-friendly locale sort for
 *   string values.
*/
export const keyedNullSort = <T>(key: keyof T, human?: boolean) => (a: T, b: T, sortOrder?: "ascend" | "descend" | null): number => {
  // We effectively reverse the sort twice when sorting in 'descend' mode, as
  // ant-design will internally reverse the array, but we always want to push
  // nullish values to the end.
  const va = sortOrder === "descend" ? b[key] : a[key];
  const vb = sortOrder === "descend" ? a[key] : b[key];

  // Push nullish values to the end
  if (va === vb) return 0;
  if (va === undefined || va === null) return 1;
  if (vb === undefined || vb === null) return -1;

  if (typeof va === "string" && typeof vb === "string") {
    // Use localeCompare for strings
    const ret = va.localeCompare(vb, undefined, human ? {
      sensitivity: "base",
      numeric: true
    } : undefined);
    return sortOrder === "descend" ? -ret : ret;
  } else {
    // Use the built-in comparison for everything else (mainly numbers)
    return sortOrder === "descend"
      ? (vb as any) - (va as any)
      : (va as any) - (vb as any);
  }
};

export const useMountEffect = (fn: EffectCallback): void => useEffect(fn, []);

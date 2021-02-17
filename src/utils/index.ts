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

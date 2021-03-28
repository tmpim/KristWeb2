// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
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

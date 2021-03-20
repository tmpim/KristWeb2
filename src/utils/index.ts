// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { EffectCallback, useEffect, useState } from "react";

import { useHistory, useLocation } from "react-router-dom";

import Debug from "debug";
const debug = Debug("kristweb:utils");

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

// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (fn: EffectCallback): void => useEffect(fn, []);


/**
 * Returns the ⌘ (command) symbol on macOS, and "Ctrl" everywhere else.
 *
 * NOTE: This is only evaluated on initial page load.
 *
 * REVIEW: This is a rather crude way to detect the platform, but it's the only
 *         method I could find online (with an admittedly non-exhaustive search)
 */
export const ctrl = /mac/i.test(navigator.platform) ? "\u2318" : "Ctrl";

/**
 * Wrapper for useState that saves its value in the browser history stack
 * as location state. Note that this doesn't yet support computed state.
 *
 * The state's value must be serialisable, and less than 2 MiB.
 *
 * @param initialState - The initial value of the state.
 * @param stateKey - The key by which to store the state's value in the history
 *   stack.
 */
export function useHistoryState<S>(
  initialState: S,
  stateKey: string
): [S, (s: S) => void] {
  const history = useHistory();
  const location = useLocation<Partial<Record<string, S>>>();

  const [state, setState] = useState<S>(
    location?.state?.[stateKey] ?? initialState
  );

  // Wraps setState to update the stored state value and replace the entry on
  // the history stack (via `updateLocation`).
  function wrappedSetState(newState: S): void {
    debug("useHistoryState: setting state %s to %o", stateKey, newState);
    updateLocation(newState);
    setState(newState);
  }

  // Merge the new state into the location state (using stateKey) and replace
  // the entry on the history stack.
  function updateLocation(newState: S) {
    const updatedLocation = {
      ...location,
      state: {
        ...location?.state,
        [stateKey]: newState
      }
    };

    debug("useHistoryState: replacing updated location:", updatedLocation);
    history.replace(updatedLocation);
  }

  return [state, wrappedSetState];
}

export const mod = (n: number, m: number): number => ((n % m) + m) % m;

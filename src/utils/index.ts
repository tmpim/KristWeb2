// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
export * from "./errors";
export * from "./misc/credits";
export * from "./misc/devState";
export * from "./misc/math";
export * from "./misc/promiseThrottle";
export * from "./misc/sort";

export const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

/** Returns the ⌘ (command) symbol on macOS, and "Ctrl" everywhere else. */
export const ctrl = /mac/i.test(navigator.platform) ? "\u2318" : "Ctrl";

export function toLookup(arr: string[]): Record<string, true> {
  const out: Record<string, true> = {};
  if (!arr) return out;

  for (let i = 0; i < arr.length; i++) {
    out[arr[i]] = true;
  }

  return out;
}

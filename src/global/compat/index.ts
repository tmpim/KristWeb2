// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { localStorageAvailable } from "./localStorage";

import { openCompatCheckModal } from "./CompatCheckModal";

import Debug from "debug";
const debug = Debug("kristweb:compat-check");

export interface CompatCheck {
  name: string;
  url?: string;
  check: () => Promise<boolean> | boolean;
}

const CHECKS: CompatCheck[] = [
  { name: "Local Storage", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
    check: localStorageAvailable },
  { name: "IndexedDB", url: "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API",
    check: () => !!window.indexedDB },
  { name: "Fetch", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API",
    check: () => !!window.fetch },
  { name: "Crypto", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto",
    check: () => !!window.crypto },
  { name: "SubtleCrypto", url: "https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto",
    check: () => !!window.crypto && !!window.crypto.subtle },
  { name: "Broadcast Channel", url: "https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API",
    check: () => !!BroadcastChannel },
  { name: "Web Workers", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers",
    check: () => !!window.Worker }
  // NOTE: Service workers are not checked here, because they are disabled in
  //       Firefox private browsing.
];

/** Checks if the browser has all the required APIs, and returns an array of
 * failed compatibility checks. */
async function runCompatChecks(): Promise<CompatCheck[]> {
  const failed: CompatCheck[] = [];
  for (const check of CHECKS) {
    try {
      if (!(await check.check()))
        throw new Error("check returned false");
    } catch (err) {
      debug("compatibility check %s failed", check.name);
      console.error(err);
      failed.push(check);
    }
  }
  return failed;
}

/** Runs the compatibility checks, displaying the "Unsupported browser" modal
 * and throwing if any of them fail. */
export async function compatCheck(): Promise<void> {
  const failedChecks = await runCompatChecks();
  if (failedChecks.length) {
    openCompatCheckModal(failedChecks);
    throw new Error("compat checks failed");
  }
}

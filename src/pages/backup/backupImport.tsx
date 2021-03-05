// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";

import { aesGcmDecrypt } from "@utils/crypto";
import { decryptCryptoJS } from "@utils/CryptoJS";

import { BackupFormatType } from "./backupFormats";

import Debug from "debug";
const debug = Debug("kristweb:backup-import");

export interface BackupResults {
  newWallets: number;
  skippedWallets: number;

  messages: {
    wallets: Record<string, BackupMessage[]>;
    friends?: Record<string, BackupMessage[]>;
  };
}

export interface BackupMessage {
  type: "success" | "warning" | "error";
  error?: Error;
  message: React.ReactNode;
}

export class BackupError extends Error {
  constructor(message: string) { super(message); }
}

/**
 * Attempts to decrypt a given value using the appropriate function for the
 * backup format, with the `masterPassword` as the password. Returns `false` if
 * decryption failed for any reason.
 */
async function backupDecryptValue(
  format: BackupFormatType,
  masterPassword: string,
  value: string
): Promise<string | false> {
  try {
    switch (format) {
    // KristWeb v1 used Crypto.JS for its cryptography (SubtleCrypto was not
    // yet widespread enough), which uses its own funky key derivation
    // algorithm. Use our polyfill for it.
    // For more info, see `utils/CryptoJS.ts`.
    case BackupFormatType.KRISTWEB_V1:
      return decryptCryptoJS(value, masterPassword);

    // KristWeb v2 simply uses WebCrypto/SubtleCrypto.
    // For more info, see `utils/crypto.ts`.
    case BackupFormatType.KRISTWEB_V2:
      return aesGcmDecrypt(value, masterPassword);
    }
  } catch (err) {
    debug("failed to decrypt backup value '%s'", value);
    console.error(err);
    return false;
  }
}

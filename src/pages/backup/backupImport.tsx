// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { TranslatedError } from "@utils/i18n";

import { aesGcmDecrypt } from "@utils/crypto";
import { decryptCryptoJS } from "@utils/CryptoJS";

import { Backup, BackupFormatType, isBackupKristWebV1 } from "./backupFormats";
import { BackupResults } from "./backupResults";
import { importV1Wallet } from "./backupImportV1";

import Debug from "debug";
const debug = Debug("kristweb:backup-import");

/**
 * Attempts to decrypt a given value using the appropriate function for the
 * backup format, with the `masterPassword` as the password. Returns `false` if
 * decryption failed for any reason.
 */
export async function backupDecryptValue(
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
      return await decryptCryptoJS(value, masterPassword);

    // KristWeb v2 simply uses WebCrypto/SubtleCrypto.
    // For more info, see `utils/crypto.ts`.
    case BackupFormatType.KRISTWEB_V2:
      return await aesGcmDecrypt(value, masterPassword);
    }
  } catch (err) {
    debug("failed to decrypt backup value '%s'", value);
    console.error(err);
    return false;
  }
}

/**
 * Attempts to decrypt a backup by verifying its salt and tester. If the
 * decryption fails (due to an incorrect master password), it will throw an
 * exception.
 */
export async function backupVerifyPassword(
  backup: Backup,
  masterPassword: string
): Promise<void> {
  // These were already verified to exist and be the correct type by
  // the decodeBackup function.
  const { salt, tester } = backup;

  if (!masterPassword)
    throw new TranslatedError("import.masterPasswordRequired");

  // Attempt to decrypt the tester with the given password. backupDecryptValue
  // will return `false` if the decryption failed for any reason.
  const testerDec = await backupDecryptValue(backup.type, masterPassword, tester);

  // Verify that the decrypted tester is equal to the salt, if not, the
  // provided master password is incorrect.
  if (testerDec === false || testerDec !== salt)
    throw new TranslatedError("import.masterPasswordIncorrect");
}

/**
 * Performs the backup import, logging any messages necessary. The process is
 * as cautious as possible.
 */
export async function backupImport(
  backup: Backup,
  masterPassword: string
): Promise<BackupResults> {
  // It is assumed at this point that the backup was already successfully
  // decoded, and the master password was verified to be correct.
  debug("beginning import (format: %s)", backup.type, backup);

  // The results instance to keep track of logged messages, etc.
  const results = new BackupResults();

  // Attempt to add the wallets
  if (isBackupKristWebV1(backup)) {
    // Import wallets from a KristWeb v1 backup
    for (const uuid in backup.wallets) {
      if (!uuid || !uuid.startsWith("Wallet-")) {
        // Not a wallet
        debug("skipping v1 wallet key %s", uuid);
        continue;
      }

      const rawWallet = backup.wallets[uuid];
      debug("importing v1 wallet uuid %s: %o", uuid, rawWallet);

      try {
        await importV1Wallet(backup, masterPassword, uuid, rawWallet, results);
      } catch (err) {
        debug("error importing v1 wallet", err);
        results.addErrorMessage("wallets", uuid, undefined, err);
      }
    }
  } else {
    debug("WTF: unsupported backup format %s", backup.type);
  }

  debug("import finished, final results:", results);
  return results;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";

import { TranslatedError } from "@utils/i18n";

import { aesGcmDecrypt, decryptCryptoJS } from "@utils/crypto";

import {
  Backup, BackupFormatType, isBackupKristWebV1, isBackupKristWebV2
} from "./backupFormats";
import { BackupResults } from "./backupResults";
import { importV1Backup } from "./backupImportV1";
import { importV2Backup } from "./backupImportV2";

import { IncrProgressFn, InitProgressFn } from "./ImportProgress";

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
  masterPassword: string,
  noOverwrite: boolean,
  onProgress: IncrProgressFn,
  initProgress: InitProgressFn
): Promise<BackupResults> {
  // It is assumed at this point that the backup was already successfully
  // decoded, and the master password was verified to be correct.
  debug("beginning import (format: %s)", backup.type);

  // Fetch the current set of wallets from the Redux store, to ensure the limit
  // isn't reached, and to handle duplication checking.
  const existingWallets = store.getState().wallets.wallets;
  const existingContacts = store.getState().contacts.contacts;
  // Used to encrypt new wallets/edited wallets
  const appMasterPassword = store.getState().masterPassword.masterPassword;
  // Used to check if an imported v1 wallet has a custom sync node
  const appSyncNode = store.getState().node.syncNode;
  // Used to re-calculate the addresses
  const addressPrefix = store.getState().node.currency.address_prefix;
  // Used to verify contact addresses
  const nameSuffix = store.getState().node.currency.name_suffix;

  // The app master password is required to import wallets. The backup import
  // is usually done through an authenticated action anyway.
  if (!appMasterPassword)
    throw new TranslatedError("import.appMasterPasswordRequired");

  // The results instance to keep track of logged messages, etc.
  const results = new BackupResults(onProgress, initProgress);

  // Attempt to add the wallets
  if (isBackupKristWebV1(backup)) {
    await importV1Backup(
      existingWallets, existingContacts,
      appMasterPassword, appSyncNode,
      addressPrefix, nameSuffix,
      backup, masterPassword, noOverwrite,
      results
    );
  } else if (isBackupKristWebV2(backup)) {
    await importV2Backup(
      existingWallets, existingContacts,
      appMasterPassword,
      addressPrefix, nameSuffix,
      backup, masterPassword, noOverwrite,
      results
    );
  } else {
    debug("WTF: unsupported backup format %s", backup.type);
  }

  debug("import finished");
  return results;
}

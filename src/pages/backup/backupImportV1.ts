// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { BackupKristWebV1, KristWebV1Wallet } from "./backupFormats";
import { BackupWalletError, BackupResults } from "./backupResults";
import { backupDecryptValue } from "./backupImport";
import {
  getShorthands, str, checkFormat, checkAddress, checkLabelValid,
  finalWalletImport
} from "./backupImportUtils";

import { WalletMap } from "@wallets";

import { isPlainObject, memoize } from "lodash-es";
import to from "await-to-js";

import Debug from "debug";
const debug = Debug("kristweb:backup-import-v1");

/** Strips http/https from a sync node to properly compare it. */
const _cleanSyncNode = memoize((node: string) => node.replace(/^https?:/, ""));

/** Imports a KristWeb v1 backup. */
export async function importV1Backup(
  // Things regarding the app's existing state
  existingWallets: WalletMap,
  appMasterPassword: string,
  appSyncNode: string,
  addressPrefix: string,

  // Things related to the backup
  backup: BackupKristWebV1,
  masterPassword: string,
  noOverwrite: boolean,

  results: BackupResults
): Promise<void> {
  // Import wallets
  for (const uuid in backup.wallets) {
    if (!uuid || !uuid.startsWith("Wallet-")) {
      // Not a wallet
      debug("skipping v1 wallet key %s", uuid);
      continue;
    }

    const rawWallet = backup.wallets[uuid];
    debug("importing v1 wallet uuid %s", uuid);

    try {
      await importV1Wallet(
        existingWallets, appMasterPassword, appSyncNode, addressPrefix,
        backup, masterPassword, noOverwrite,
        uuid, rawWallet,
        results
      );
    } catch (err) {
      debug("error importing v1 wallet", err);
      results.addErrorMessage("wallets", uuid, undefined, err);
    }
  }

  // TODO: Import contacts
}

/** Imports a single wallet in the KristWeb v1 format. */
export async function importV1Wallet(
  // Things regarding the app's existing state
  existingWallets: WalletMap,
  appMasterPassword: string,
  appSyncNode: string,
  addressPrefix: string,

  // Things related to the backup
  backup: BackupKristWebV1,
  masterPassword: string,
  noOverwrite: boolean,

  uuid: string,
  rawWallet: string, // The encrypted wallet

  results: BackupResults
): Promise<void> {
  const { type } = backup;
  const shorthands = getShorthands(results, uuid, "v1");
  const { success, importWarn } = shorthands;

  // ---------------------------------------------------------------------------
  // DECRYPTION, BASIC VALIDATION
  // ---------------------------------------------------------------------------
  // Validate the type of the wallet data
  if (!str(rawWallet)) {
    debug("v1 wallet %s had type %s", uuid, typeof rawWallet, rawWallet);
    throw new BackupWalletError("errorInvalidTypeString");
  }

  // Attempt to decrypt the wallet
  const dec = await backupDecryptValue(type, masterPassword, rawWallet);
  if (dec === false) throw new BackupWalletError("errorDecrypt");

  // Parse JSON, promisify to catch syntax errors
  const [err, wallet]: [Error | null, KristWebV1Wallet] =
    await to((async () => JSON.parse(dec))());
  if (err) throw new BackupWalletError("errorWalletJSON");

  // Validate the type of the decrypted wallet data
  if (!isPlainObject(wallet)) {
    debug("v1 wallet %s had decrypted type %s", uuid, typeof wallet);
    throw new BackupWalletError("errorInvalidTypeObject");
  }

  // ---------------------------------------------------------------------------
  // REQUIRED PROPERTY VALIDATION
  // ---------------------------------------------------------------------------
  const { format, username } = checkFormat(shorthands, wallet);

  // The password and masterkey must be present
  const { password, masterkey } = wallet;
  if (!str(password)) throw new BackupWalletError("errorPasswordMissing");
  if (!str(masterkey)) throw new BackupWalletError("errorMasterKeyMissing");

  // ---------------------------------------------------------------------------
  // OPTIONAL PROPERTY VALIDATION
  // ---------------------------------------------------------------------------
  // Check if the wallet was using a custom sync node (ignoring http/https)
  const cleanAppSyncNode = _cleanSyncNode(appSyncNode);
  const { syncNode } = wallet;
  if (syncNode && _cleanSyncNode(syncNode) !== cleanAppSyncNode)
    importWarn("warningSyncNode");

  // Check if the wallet was using a custom icon
  if (str(wallet.icon)) importWarn("warningIcon");

  // Check that the label is valid
  const { label } = wallet;
  checkLabelValid(shorthands, label);

  // ---------------------------------------------------------------------------
  // WALLET IMPORT PREPARATION/VALIDATION
  // ---------------------------------------------------------------------------
  const { address, existingWallet, existingImportWallet } = await checkAddress(
    addressPrefix, existingWallets, results, uuid,
    masterkey, "errorMasterKeyMismatch",
    format, password, username
  );

  // Skip with no additional checks or updates if this wallet was already
  // handled by this backup import
  if (existingImportWallet) {
    results.skippedWallets++;
    return success({ key: "import.walletMessages.successImportSkipped", args: { address }});
  }

  // ---------------------------------------------------------------------------
  // WALLET IMPORT
  // ---------------------------------------------------------------------------
  await finalWalletImport(
    existingWallets, appMasterPassword, addressPrefix,
    shorthands, results, noOverwrite,
    existingWallet, address, password,
    { label, username, format }
  );
}

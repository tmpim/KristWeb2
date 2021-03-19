// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { BackupKristWebV2, KristWebV2Wallet } from "./backupFormats";
import { BackupWalletError, BackupResults } from "./backupResults";
import {
  getShorthands, str, checkFormat, checkAddress, checkLabelValid,
  checkCategoryValid, finalWalletImport
} from "./backupImportUtils";

import { WalletMap, decryptWallet } from "@wallets";

import { isPlainObject } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:backup-import-v2");

const UUID_REGEXP = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/;

/** Imports a KristWeb v2 backup. */
export async function importV2Backup(
  // Things regarding the app's existing state
  existingWallets: WalletMap,
  appMasterPassword: string,
  addressPrefix: string,

  // Things related to the backup
  backup: BackupKristWebV2,
  masterPassword: string,
  noOverwrite: boolean,

  results: BackupResults
): Promise<void> {
  // Import wallets
  for (const uuid in backup.wallets) {
    if (!uuid || !UUID_REGEXP.test(uuid)) {
      // Not a wallet
      debug("skipping v2 wallet key %s", uuid);
      continue;
    }

    const rawWallet = backup.wallets[uuid];
    debug("importing v2 wallet uuid %s", uuid);

    try {
      await importV2Wallet(
        existingWallets, appMasterPassword, addressPrefix,
        masterPassword, noOverwrite,
        uuid, rawWallet,
        results
      );
    } catch (err) {
      debug("error importing v2 wallet", err);
      results.addErrorMessage("wallets", uuid, undefined, err);
    }
  }

  // TODO: Import contacts
}

/** Imports a single wallet in the KristWeb v2 format. */
export async function importV2Wallet(
  // Things regarding the app's existing state
  existingWallets: WalletMap,
  appMasterPassword: string,
  addressPrefix: string,

  // Things related to the backup
  masterPassword: string,
  noOverwrite: boolean,

  uuid: string,
  wallet: KristWebV2Wallet, // The wallet object as found in the backup

  results: BackupResults
): Promise<void> {
  const shorthands = getShorthands(results, uuid, "v2");
  const { success } = shorthands;

  // ---------------------------------------------------------------------------
  // REQUIRED PROPERTY VALIDATION
  // ---------------------------------------------------------------------------
  // Validate the type of the wallet data
  if (!isPlainObject(wallet)) {
    debug("v2 wallet %s had type %s", uuid, typeof wallet, wallet);
    throw new BackupWalletError("errorInvalidTypeObject");
  }

  const { format, username } = checkFormat(shorthands, wallet);

  // The encrypted password and private key must be present
  const { encPassword, encPrivatekey } = wallet;
  if (!str(encPassword)) throw new BackupWalletError("errorPasswordMissing");
  if (!str(encPrivatekey)) throw new BackupWalletError("errorPrivateKeyMissing");

  // ---------------------------------------------------------------------------
  // OPTIONAL PROPERTY VALIDATION
  // ---------------------------------------------------------------------------
  // Check that the label and category are valid
  const { label, category } = wallet;
  checkLabelValid(shorthands, label);
  checkCategoryValid(shorthands, category);

  // ---------------------------------------------------------------------------
  // WALLET IMPORT PREPARATION/VALIDATION
  // ---------------------------------------------------------------------------
  // Attempt to decrypt the password and private key
  const dec = await decryptWallet(masterPassword, wallet);
  if (!dec) throw new BackupWalletError("errorDecrypt");
  const { password, privatekey } = dec;

  const { address, existingWallet, existingImportWallet } = await checkAddress(
    addressPrefix, existingWallets, results, uuid,
    privatekey, "errorPrivateKeyMismatch",
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
    { label, category, username, format }
  );
}

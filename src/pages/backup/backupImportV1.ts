// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import {
  BackupKristWebV1, KristWebV1Wallet, KristWebV1Contact
} from "./backupFormats";
import {
  BackupError, BackupWalletError, BackupContactError, BackupResults
} from "./backupResults";
import { backupDecryptValue } from "./backupImport";
import {
  getShorthands, Shorthands, str, checkFormat, checkAddress, checkLabelValid,
  finalWalletImport,
  validateContactAddress, checkExistingContact, finalContactImport
} from "./backupImportUtils";

import { WalletMap } from "@wallets";
import { ContactMap } from "@contacts";

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
  existingContacts: ContactMap,
  appMasterPassword: string,
  appSyncNode: string,
  addressPrefix: string,
  nameSuffix: string,

  // Things related to the backup
  backup: BackupKristWebV1,
  masterPassword: string,
  noOverwrite: boolean,

  results: BackupResults
): Promise<void> {
  const walletCount = Object.keys(backup.wallets).length;
  const contactCount = Object.keys(backup.friends || {}).length;
  results.initProgress(walletCount + contactCount);

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
    } finally {
      results.onProgress();
    }
  }

  // Import contacts
  if (backup.friends) {
    for (const uuid in backup.friends) {
      if (!uuid || !uuid.startsWith("Friend-")) {
        // Not a contact
        debug("skipping v1 contact key %s", uuid);
        continue;
      }

      const rawContact = backup.friends[uuid];
      debug("importing v1 contact uuid %s", uuid);

      try {
        await importV1Contact(
          existingContacts, appSyncNode, addressPrefix, nameSuffix,
          backup, masterPassword, noOverwrite,
          uuid, rawContact,
          results
        );
      } catch (err) {
        debug("error importing v1 contact", err);
        results.addErrorMessage("contacts", uuid, undefined, err);
      } finally {
        results.onProgress();
      }
    }
  }
}

/** Decrypts and validates a V1 wallet or contact. */
async function importV1Object<T extends KristWebV1Wallet | KristWebV1Contact>(
  backup: BackupKristWebV1,
  masterPassword: string,

  uuid: string,
  rawObject: string, // The encrypted wallet/contact

  mkErr: (key: string) => BackupError // Error constructor
): Promise<T> {
  const { type } = backup;

  // ---------------------------------------------------------------------------
  // DECRYPTION, BASIC VALIDATION
  // ---------------------------------------------------------------------------
  // Validate the type of the wallet/contact data
  if (!str(rawObject)) {
    debug("v1 object %s had type %s", uuid, typeof rawObject, rawObject);
    throw mkErr("errorInvalidTypeString");
  }

  // Attempt to decrypt the wallet/contact
  const dec = await backupDecryptValue(type, masterPassword, rawObject);
  if (dec === false) throw mkErr("errorDecrypt");

  // Parse JSON, promisify to catch syntax errors
  const [err, obj] =
    await to((async () => JSON.parse(dec))());
  if (err) throw mkErr("errorDataJSON");

  // Validate the type of the decrypted wallet/contact data
  if (!isPlainObject(obj)) {
    debug("v1 object %s had decrypted type %s", uuid, typeof obj);
    throw mkErr("errorInvalidTypeObject");
  }

  return obj;
}

/** Validates and cleans the sync node */
function validateSyncNode(
  { importWarn }: Shorthands,
  appSyncNode: string,
  object: { syncNode?: string }
): void {
  // Check if the wallet or contact was using a custom sync node (ignoring
  // http/https)
  const cleanAppSyncNode = _cleanSyncNode(appSyncNode);
  const { syncNode } = object;
  if (syncNode && _cleanSyncNode(syncNode) !== cleanAppSyncNode)
    importWarn("warningSyncNode");
}

// =============================================================================
// WALLET IMPORT
// =============================================================================

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
  const shorthands = getShorthands(results, uuid, "v1");
  const { success, importWarn } = shorthands;

  // Decrypt and validate the wallet
  const wallet = await importV1Object<KristWebV1Wallet>(
    backup, masterPassword, uuid, rawWallet,
    key => new BackupWalletError(key)
  );

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
  validateSyncNode(shorthands, appSyncNode, wallet);
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

// =============================================================================
// CONTACT IMPORT
// =============================================================================

/** Imports a single contact in the KristWeb v1 format. */
export async function importV1Contact(
  // Things regarding the app's existing state
  existingContacts: ContactMap,
  appSyncNode: string,
  addressPrefix: string,
  nameSuffix: string,

  // Things related to the backup
  backup: BackupKristWebV1,
  masterPassword: string,
  noOverwrite: boolean,

  uuid: string,
  rawContact: string, // The encrypted contact

  results: BackupResults
): Promise<void> {
  const shorthands = getShorthands(results, uuid, "v1", "contact");
  const { success, importWarn } = shorthands;

  // Decrypt and validate the contact
  const contact = await importV1Object<KristWebV1Contact>(
    backup, masterPassword, uuid, rawContact,
    key => new BackupContactError(key)
  );

  // Validate the address, which is required
  const { address, isName } =
    validateContactAddress(addressPrefix, nameSuffix, contact);

  results.setResultLabel("contacts", uuid, address);

  // Check for unsupported properties
  validateSyncNode(shorthands, appSyncNode, contact);
  if (str(contact.icon)) importWarn("warningIcon");

  // Check that the label is valid
  const { label } = contact;
  checkLabelValid(shorthands, label);

  // Check for existing contacts
  const { existingContact, existingImportContact } = checkExistingContact(
    existingContacts, results, address);

  // Skip with no additional checks or updates if this contact was already
  // handled by this backup import
  if (existingImportContact) {
    results.skippedContacts++;
    return success({ key: "import.contactMessages.successImportSkipped", args: { address }});
  }

  // Import the contact
  finalContactImport(
    existingContacts,
    shorthands, results, noOverwrite,
    existingContact, address, label, isName
  );
}

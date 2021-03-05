// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";

import { BackupKristWebV1, KristWebV1Wallet } from "./backupFormats";
import { BackupWalletError, BackupResults, MessageType } from "./backupResults";
import { backupDecryptValue } from "./backupImport";

import {
  WALLET_FORMATS, ADVANCED_FORMATS, WalletFormatName, formatNeedsUsername
} from "@wallets/WalletFormat";

import { isPlainObject, memoize } from "lodash-es";
import to from "await-to-js";

import Debug from "debug";
const debug = Debug("kristweb:backup-import-v1");

/** Strips http/https from a sync node to properly compare it. */
const _cleanSyncNode = memoize((node: string) => node.replace(/^https?:/, ""));

/** Converts a v1 format name to a v2 format name. */
const _upgradeFormatName = (name: string): WalletFormatName =>
  name === "krist" ? "api" : name as WalletFormatName;

/**
 * Imports a single wallet in the KristWeb v1 format.
 */
export async function importV1Wallet(
  backup: BackupKristWebV1,
  masterPassword: string,
  uuid: string,
  rawWallet: string, // The encrypted wallet
  results: BackupResults
): Promise<void> {
  const { type } = backup;

  // Shorthand functions
  const warn = results.addWarningMessage.bind(results, "wallets", uuid);
  const success = results.addSuccessMessage.bind(results, "wallets", uuid);

  // Warnings to only be added if the wallet was actually added
  const importWarnings: MessageType[] = [];
  const importWarn = (msg: MessageType) => {
    debug("v1 wallet %s added import warning:", uuid, msg);
    importWarnings.push(msg);
  };

  /** Asserts that `val` is a truthy string */
  const str = (val: any): val is string => val && typeof val === "string";

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

  debug("v1 wallet %s full data:", uuid, wallet);

  // Validate the type of the decrypted wallet data
  if (!isPlainObject(wallet)) {
    debug("v1 wallet %s had decrypted type %s", uuid, typeof wallet, wallet);
    throw new BackupWalletError("errorInvalidTypeObject");
  }

  // ---------------------------------------------------------------------------
  // REQUIRED PROPERTY VALIDATION
  // ---------------------------------------------------------------------------
  // Check if the wallet format is present
  if (!str(wallet.format)) throw new BackupWalletError("errorFormatMissing");

  // Check if the wallet format is supported (converting the old format name
  // `krist` to `api` if necessary)
  const format = _upgradeFormatName(wallet.format);
  if (!WALLET_FORMATS[format]) throw new BackupWalletError("errorUnknownFormat");

  // If the wallet format requires a username, check that the username is
  // actually present
  const { username } = wallet;
  if (formatNeedsUsername(format) && !str(username))
    throw new BackupWalletError("errorUsernameMissing");

  // The password and masterkey must be present
  const { password, masterkey } = wallet;
  if (!str(password)) throw new BackupWalletError("errorPasswordMissing");
  if (!str(masterkey)) throw new BackupWalletError("errorMasterKeyMissing");

  // ---------------------------------------------------------------------------
  // OPTIONAL PROPERTY VALIDATION
  // ---------------------------------------------------------------------------
  // Check if the wallet was using a custom sync node (ignoring http/https)
  const appSyncNode = _cleanSyncNode(store.getState().node.syncNode);
  const { syncNode } = wallet;
  if (syncNode && _cleanSyncNode(syncNode) !== appSyncNode)
    importWarn("warningSyncNode");

  // Check if the wallet was using a custom icon
  if (str(wallet.icon)) importWarn("warningIcon");

  // Check that the label is valid for KristWeb v2
  const { label } = wallet;
  const labelValid = str(label) && label.trim().length < 32;
  if (label && !labelValid) importWarn("warningLabelInvalid");

  // Check if the wallet is using an advanced (unsupported) format
  if (ADVANCED_FORMATS.includes(format))
    importWarn({ key: "import.walletMessages.warningAdvancedFormat", args: { format }});
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { BackupResults, BackupWalletError, MessageType } from "./backupResults";

import {
  ADDRESS_LIST_LIMIT,
  WALLET_FORMATS, ADVANCED_FORMATS, WalletFormatName, formatNeedsUsername,
  WalletMap, Wallet, WalletNew, calculateAddress, editWalletLabel, addWallet
} from "@wallets";

import Debug from "debug";
const debug = Debug("kristweb:backup-import-utils");

interface ShorthandsRes {
  warn: (message: MessageType) => void;
  success: (message: MessageType) => void;

  importWarnings: MessageType[];
  importWarn: (msg: MessageType) => void;
}

export function getShorthands(
  results: BackupResults,
  uuid: string,
  version: string
): ShorthandsRes {
  const warn = results.addWarningMessage.bind(results, "wallets", uuid);
  const success = results.addSuccessMessage.bind(results, "wallets", uuid);

  // Warnings to only be added if the wallet was actually added
  const importWarnings: MessageType[] = [];
  const importWarn = (msg: MessageType) => {
    debug("%s wallet %s added import warning:", version, uuid, msg);

    // Prepend the i18n key if it was just a string
    importWarnings.push(typeof msg === "string"
      ? "import.walletMessages." + msg
      : msg);
  };

  return { warn, success, importWarnings, importWarn };
}

/** Asserts that `val` is a truthy string */
export const str = (val: any): val is string => val && typeof val === "string";

// -----------------------------------------------------------------------------
// REQUIRED PROPERTY VALIDATION
// -----------------------------------------------------------------------------
/** Converts a v1 format name to a v2 format name. */
const _upgradeFormatName = (name: string): WalletFormatName =>
  name === "krist" ? "api" : name as WalletFormatName;

/** Verifies that the wallet's format is valid, upgrade it if necessary,
 * and check if it's an advanced format. */
export function checkFormat(
  { importWarn }: ShorthandsRes,
  wallet: { format?: string; username?: string }
): {
  format: WalletFormatName;
  username?: string;
} {
  // Check if the wallet format is supported (converting the old format name
  // `krist` to `api` if necessary)
  const format = _upgradeFormatName(wallet.format || "kristwallet");
  if (!WALLET_FORMATS[format]) throw new BackupWalletError("errorUnknownFormat");

  // Check if the wallet is using an advanced (unsupported) format
  if (ADVANCED_FORMATS.includes(format))
    importWarn({ key: "import.walletMessages.warningAdvancedFormat", args: { format }});

  // If the wallet format requires a username, check that the username is
  // actually present
  const { username } = wallet;
  if (formatNeedsUsername(format) && !str(username))
    throw new BackupWalletError("errorUsernameMissing");

  return { format, username };
}

// -----------------------------------------------------------------------------
// OPTIONAL PROPERTY VALIDATION
// -----------------------------------------------------------------------------
export const isLabelValid = (label?: string): boolean =>
  str(label) && label.trim().length < 32;
export function checkLabelValid({ importWarn }: ShorthandsRes, label?: string): void {
  const labelValid = isLabelValid(label);
  if (label && !labelValid) importWarn("warningLabelInvalid");
}

export const isCategoryValid = isLabelValid;
export function checkCategoryValid({ importWarn }: ShorthandsRes, category?: string): void {
  const categoryValid = isCategoryValid(category);
  if (category && !categoryValid) importWarn("warningCategoryInvalid");
}

// -------------------------- ---------------------------------------------------
// WALLET IMPORT PREPARATION/VALIDATION
// -----------------------------------------------------------------------------
interface CheckAddressRes {
  address: string;
  privatekey: string;
  existingWallet?: Wallet;
  existingImportWallet?: Wallet;
}

export async function checkAddress(
  addressPrefix: string,
  existingWallets: WalletMap,
  results: BackupResults,
  uuid: string,

  oldPrivatekey: string,
  privatekeyMismatchErrorKey:
    "errorMasterKeyMismatch" | "errorPrivateKeyMismatch",

  format: WalletFormatName | undefined,
  password: string,
  username?: string
): Promise<CheckAddressRes> {
  // Calculate the address in advance, to check for existing wallets
  const { privatekey, address } = await calculateAddress(
    addressPrefix,
    format || "kristwallet",
    password,
    username
  );

  // Display the address in the results tree
  results.setResultLabel("wallets", uuid, address);

  // Check that our calculated private key is actually equal to the stored
  // private key. In practice these should never be different.
  if (privatekey !== oldPrivatekey)
    throw new BackupWalletError(privatekeyMismatchErrorKey);

  // Check if a wallet already exists, either in the Redux store, or our list of
  // imported wallets during this backup import
  const existingWallet = Object.values(existingWallets)
    .find(w => w.address === address);
  const existingImportWallet = results.importedWallets
    .find(w => w.address === address);

  return { address, privatekey, existingWallet, existingImportWallet };
}

// -----------------------------------------------------------------------------
// WALLET IMPORT
// -----------------------------------------------------------------------------
export async function finalWalletImport(
  existingWallets: WalletMap,
  appMasterPassword: string,
  addressPrefix: string,

  shorthands: ShorthandsRes,
  results: BackupResults,
  noOverwrite: boolean,

  existingWallet: Wallet | undefined,
  address: string,
  password: string,
  newWalletData: WalletNew
): Promise<void> {
  const { warn, success, importWarnings } = shorthands;

  const { label } = newWalletData;
  const labelValid = isLabelValid(label);

  // Handle duplicate wallets
  if (existingWallet) {
    // The wallet already exists in the Redux store, so determine if we need to
    // update its label (only if it was determined to be valid)
    if (labelValid && existingWallet.label !== label!.trim()) {
      if (noOverwrite) {
        // The user didn't want to overwrite the wallet, so skip it
        results.skippedWallets++;
        return success({ key: "import.walletMessages.successSkippedNoOverwrite", args: { address }});
      } else {
        const newLabel = label!.trim();
        debug(
          "changing existing wallet %s (%s) label from %s to %s",
          existingWallet.id, existingWallet.address,
          existingWallet.label, newLabel
        );

        await editWalletLabel(existingWallet, newLabel);

        return success({ key: "import.walletMessages.successUpdated", args: { address, label: newLabel }});
      }
    } else {
      results.skippedWallets++;
      return success({ key: "import.walletMessages.successSkipped", args: { address }});
    }
  }

  // No existing wallet to update/skip, so now check if we can add it without
  // going over the wallet limit
  const currentWalletCount =
    Object.keys(existingWallets).length + results.importedWallets.length;
  if (currentWalletCount >= ADDRESS_LIST_LIMIT)
    throw new BackupWalletError("errorLimitReached");

  // Now that we're actually importing the wallet, push any warnings that may
  // have been generated
  importWarnings.forEach(warn);

  debug("adding new wallet %s", address);
  const newWallet = await addWallet(
    addressPrefix, appMasterPassword,
    newWalletData, password,
    true
  );
  debug("new wallet %s (%s)", newWallet.id, newWallet.address);

  // Add it to the results
  results.newWallets++;
  results.importedWallets.push(newWallet); // To keep track of limits
  return success("import.walletMessages.success");
}

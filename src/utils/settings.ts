// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { PickByValue } from "utility-types";

import { store } from "@app";
import * as actions from "@actions/SettingsActions";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import i18n from "./i18n";
import { message } from "antd";

import Debug from "debug";
const debug = Debug("kristweb:settings");

export interface SettingsState {
  // ===========================================================================
  // AUTO-REFRESH SETTINGS
  // ===========================================================================
  /** Whether or not tables (e.g. transactions, names) should auto-refresh
   * when a change is detected on the network. */
  readonly autoRefreshTables: boolean;
  /** Whether or not the address page should auto-refresh when a change is
   * detected on the network. */
  readonly autoRefreshAddressPage: boolean;
  /** Whether or not the name page should auto-refresh when a change is detected
   * on the network. */
  readonly autoRefreshNamePage: boolean;

  // ===========================================================================
  // ADVANCED SETTINGS
  // ===========================================================================
  /** Always include mined transactions by default in transaction listings. */
  readonly alwaysIncludeMined: boolean;
  /** Whether or not to include the name suffix when copying a name. */
  readonly copyNameSuffixes: boolean;
  /** Show copy buttons next to all addresses. */
  readonly addressCopyButtons: boolean;
  /** Show copy buttons next to all names. */
  readonly nameCopyButtons: boolean;
  /** Show copy buttons next to all block hashes. */
  readonly blockHashCopyButtons: boolean;
  /** Show relative dates instead of absolute ones when they are recent. */
  readonly showRelativeDates: boolean;
  /** Show dates in a native date format from the language. */
  readonly showNativeDates: boolean;
  /** Highlight own transactions in the transactions table. */
  readonly transactionsHighlightOwn: boolean;
  /** Highlight verified addresses in the transactions table. */
  readonly transactionsHighlightVerified: boolean;
  /** Default to the 'Raw' tab instead of 'CommonMeta' on the transaction page. */
  readonly transactionDefaultRaw: boolean;
  /** Prompt for confirmation for all transactions. */
  readonly confirmTransactions: boolean;
  /** Clear the Send Transaction form after clicking 'Send'. */
  readonly clearTransactionForm: boolean;
  /** Time to wait, in milliseconds, before allowing another transaction to be sent. */
  readonly sendTransactionDelay: number;
  /** Default page size for table listings. */
  readonly defaultPageSize: number;
  /** Enable table navigation hotkeys (left and right arrows). */
  readonly tableHotkeys: boolean;
  /** Overwrite labels when importing wallets. */
  readonly importOverwrite: boolean;

  // ===========================================================================
  // DEBUG SETTINGS
  // ===========================================================================
  /** Whether or not advanced wallet formats are enabled. */
  readonly walletFormats: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  autoRefreshTables: true,
  autoRefreshAddressPage: true,
  autoRefreshNamePage: true,

  alwaysIncludeMined: false,
  copyNameSuffixes: true,
  addressCopyButtons: false,
  nameCopyButtons: false,
  blockHashCopyButtons: false,
  showRelativeDates: true,
  showNativeDates: false,
  transactionsHighlightOwn: true,
  transactionsHighlightVerified: false,
  transactionDefaultRaw: false,
  confirmTransactions: false,
  clearTransactionForm: false,
  sendTransactionDelay: 300,
  defaultPageSize: 15,
  tableHotkeys: true,
  importOverwrite: true,

  walletFormats: false
};

export type AnySettingName = keyof SettingsState;
export type SettingName<T> = keyof PickByValue<SettingsState, T>;

export interface IntegerSettingConfig {
  min?: number;
  max?: number;
}

export const SETTING_CONFIGS: Partial<Record<AnySettingName, IntegerSettingConfig | undefined>> = {
  defaultPageSize: { min: 10, max: 200 }
};

export const getSettingKey = (settingName: AnySettingName): string =>
  "settings." + settingName;

export function loadSettings(): SettingsState {
  // Import the default settings first
  const settings = { ...DEFAULT_SETTINGS };
  debug("loading settings");

  // Using the default settings as a template, import the settings from local
  // storage
  for (const [settingName, value] of Object.entries(settings) as [AnySettingName, any][]) {
    const stored = localStorage.getItem(getSettingKey(settingName));
    debug("setting %s - stored: %o - default: %o", settingName, stored, value);

    if (stored === null) {
      debug("setting %s does not have a stored value", settingName);
      continue;
    }

    switch (typeof value) {
    case "boolean":
      settings[settingName as SettingName<boolean>] = stored === "true";
      break;
    case "number":
      settings[settingName as SettingName<number>] = parseInt(stored);
      break;
    }
  }

  return settings;
}

export function notifySettingChange(): void {
  message.success(i18n.t("settings.messageSuccess"));
}

export function setBooleanSetting(
  settingName: SettingName<boolean>,
  value: boolean,
  notify = true
): void {
  debug("changing setting [boolean] %s value to %o", settingName, value);
  localStorage.setItem(getSettingKey(settingName), value ? "true" : "false");
  store.dispatch(actions.setBooleanSetting(settingName, value));
  if (notify) notifySettingChange();
}

export function setIntegerSetting(
  settingName: SettingName<number>,
  value: number,
  notify = true
): void {
  debug("changing setting [integer] %s value to %o", settingName, value);
  localStorage.setItem(getSettingKey(settingName), Math.floor(value).toString());
  store.dispatch(actions.setIntegerSetting(settingName, value));
  if (notify) notifySettingChange();
}

export function validateIntegerSetting(settingName: SettingName<number>, value: number): boolean {
  const config = SETTING_CONFIGS[settingName];
  if (!config) return true;

  if (config.min !== undefined && value < config.min) return false;
  if (config.max !== undefined && value > config.max) return false;

  return true;
}

export function isValidSyncNode(syncNode?: string): boolean {
  if (!syncNode) return false;

  try {
    const url = new URL(syncNode);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

/** React hook that gets the value of a boolean setting. */
export const useBooleanSetting = (setting: SettingName<boolean>): boolean =>
  useSelector((s: RootState) => s.settings[setting]);

/** React hook that gets the value of an integer setting. */
export const useIntegerSetting = (setting: SettingName<number>): number =>
  useSelector((s: RootState) => s.settings[setting]);

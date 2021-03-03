// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { PickByValue } from "utility-types";

import { store } from "../App";
import * as actions from "../store/actions/SettingsActions";

import { useSelector } from "react-redux";
import { RootState } from "../store";

import Debug from "debug";
const debug = Debug("kristweb:settings");

export interface SettingsState {
  /** Whether or not tables (e.g. transactions, names) should auto-refresh
   * when a change is detected on the network. */
  readonly autoRefreshTables: boolean;

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
  /** Default to the 'Raw' tab instead of 'CommonMeta' on the transaction page. */
  readonly transactionDefaultRaw: boolean;

  /** Whether or not advanced wallet formats are enabled. */
  readonly walletFormats: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  autoRefreshTables: true,

  alwaysIncludeMined: false,
  copyNameSuffixes: true,
  addressCopyButtons: false,
  nameCopyButtons: false,
  blockHashCopyButtons: false,
  showRelativeDates: false,
  transactionDefaultRaw: false,

  walletFormats: false
};

export type AnySettingName = keyof SettingsState;
export type SettingName<T> = keyof PickByValue<SettingsState, T>;

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
      settings[settingName] = stored === "true";
      break;
    }

    // TODO: more setting types
  }

  return settings;
}

export function setBooleanSetting(settingName: SettingName<boolean>, value: boolean): void {
  debug("changing setting %s value to %o", settingName, value);
  localStorage.setItem(getSettingKey(settingName), value ? "true" : "false");
  store.dispatch(actions.setBooleanSetting(settingName, value));
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

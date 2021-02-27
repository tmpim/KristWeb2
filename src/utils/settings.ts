// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { PickByValue } from "utility-types";

import { store } from "../App";
import * as actions from "../store/actions/SettingsActions";

export interface SettingsState {
  /** Whether or not advanced wallet formats are enabled. */
  readonly walletFormats: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  walletFormats: false
};

export type AnySettingName = keyof SettingsState;
export type SettingName<T> = keyof PickByValue<SettingsState, T>;

export const getSettingKey = (settingName: AnySettingName): string =>
  "settings." + settingName;

export function loadSettings(): SettingsState {
  // Import the default settings first
  const settings = { ...DEFAULT_SETTINGS };

  // Using the default settings as a template, import the settings from local
  // storage
  for (const [settingName, value] of Object.entries(settings) as [AnySettingName, any][]) {
    const stored = localStorage.getItem(getSettingKey(settingName));
    if (stored === null) continue;

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

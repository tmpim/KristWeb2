import { PickByValue } from "utility-types";

import { AppDispatch } from "../App";
import * as actions from "../store/actions/Settings";

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

export function setBooleanSetting(dispatch: AppDispatch, settingName: SettingName<boolean>, value: boolean): void {
  localStorage.setItem(getSettingKey(settingName), value ? "true" : "false");
  dispatch(actions.setBooleanSetting(settingName, value));
}

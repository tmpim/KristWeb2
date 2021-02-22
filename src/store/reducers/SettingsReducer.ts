// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createReducer, ActionType } from "typesafe-actions";
import { loadSettings, SettingsState } from "../../utils/settings";
import { setBooleanSetting } from "../actions/SettingsActions";

export type State = SettingsState;

export function getInitialSettingsState(): State {
  return loadSettings();
}

export const SettingsReducer = createReducer({} as State)
  .handleAction(setBooleanSetting, (state: State, action: ActionType<typeof setBooleanSetting>) => ({
    ...state,
    [action.payload.settingName]: action.payload.value
  }));

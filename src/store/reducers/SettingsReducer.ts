// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createReducer } from "typesafe-actions";
import { loadSettings, SettingsState } from "@utils/settings";
import {
  setBooleanSetting, setIntegerSetting, setImportedLang
} from "@actions/SettingsActions";

import { AnalysedLanguages } from "@pages/settings/translations/analyseLangs";

export type State = SettingsState & {
  /** Language imported by JSON in the translations debug page. */
  readonly importedLang?: AnalysedLanguages;
};

export function getInitialSettingsState(): State {
  return {
    ...loadSettings(),
    importedLang: undefined
  };
}

export const SettingsReducer = createReducer({} as State)
  .handleAction(setBooleanSetting, (state, action) => ({
    ...state,
    [action.payload.settingName]: action.payload.value
  }))
  .handleAction(setIntegerSetting, (state, action) => ({
    ...state,
    [action.payload.settingName]: action.payload.value
  }))
  .handleAction(setImportedLang, (state, { payload }) => ({
    ...state,
    importedLang: payload
  }));

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { PickByValue } from "utility-types";
import { createAction } from "typesafe-actions";

import * as constants from "../constants";

import { State } from "@reducers/SettingsReducer";

import { AnalysedLanguages } from "@pages/settings/translations/analyseLangs";

// Boolean settings
export interface SetBooleanSettingPayload {
  settingName: keyof PickByValue<State, boolean>;
  value: boolean;
}
export const setBooleanSetting = createAction(constants.SET_BOOLEAN_SETTING,
  (settingName, value): SetBooleanSettingPayload =>
    ({ settingName, value }))<SetBooleanSettingPayload>();

// Integer settings
export interface SetIntegerSettingPayload {
  settingName: keyof PickByValue<State, number>;
  value: number;
}
export const setIntegerSetting = createAction(constants.SET_INTEGER_SETTING,
  (settingName, value): SetIntegerSettingPayload =>
    ({ settingName, value }))<SetIntegerSettingPayload>();

// Set imported language
export const setImportedLang = createAction(constants.SET_IMPORTED_LANG)<AnalysedLanguages>();

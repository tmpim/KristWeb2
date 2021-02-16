import { createReducer, ActionType } from "typesafe-actions";
import { loadSettings, SettingsState } from "../../utils/settings";
import { setBooleanSetting } from "../actions/Settings";

export type State = SettingsState;

export function getInitialSettingsState(): State {
  return loadSettings();
}

export const SettingsReducer = createReducer({} as State)
  .handleAction(setBooleanSetting, (state: State, action: ActionType<typeof setBooleanSetting>) => ({
    ...state,
    [action.payload.settingName]: action.payload.value
  }));

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createAction } from "typesafe-actions";

import * as constants from "../constants";

export const openLogin = createAction(constants.OPEN_LOGIN)<void>();
export const browseAsGuest = createAction(constants.BROWSE_AS_GUEST)<void>();

export interface LoginPayload { password: string };
export const login = createAction(constants.LOGIN, 
  (password: string): LoginPayload => ({ password }))<LoginPayload>();

export interface SetMasterPasswordPayload { 
  salt: string;
  tester: string;
  password: string;
};
export const setMasterPassword = createAction(constants.SET_MASTER_PASSWORD, 
  (salt: string, tester: string, password: string): SetMasterPasswordPayload => 
    ({ salt, tester, password }))<SetMasterPasswordPayload>();

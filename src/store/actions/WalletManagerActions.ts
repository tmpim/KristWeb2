import { createAction } from "typesafe-actions";

import * as constants from "../constants";

export interface AuthMasterPasswordPayload { password: string };
export const authMasterPassword = createAction(constants.AUTH_MASTER_PASSWORD,
  (password): AuthMasterPasswordPayload =>
    ({ password }))<AuthMasterPasswordPayload>();

export interface SetMasterPasswordPayload {
  salt: string;
  tester: string;
  password: string;
};
export const setMasterPassword = createAction(constants.SET_MASTER_PASSWORD,
  (salt, tester, password): SetMasterPasswordPayload =>
    ({ salt, tester, password }))<SetMasterPasswordPayload>();

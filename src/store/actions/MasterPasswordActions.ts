// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createAction } from "typesafe-actions";

import * as constants from "../constants";

export interface AuthMasterPasswordPayload { password: string }
export const authMasterPassword = createAction(constants.AUTH_MASTER_PASSWORD,
  (password): AuthMasterPasswordPayload =>
    ({ password }))<AuthMasterPasswordPayload>();

export interface SetMasterPasswordPayload {
  salt: string;
  tester: string;
  password: string;
}
export const setMasterPassword = createAction(constants.SET_MASTER_PASSWORD,
  (salt, tester, password): SetMasterPasswordPayload =>
    ({ salt, tester, password }))<SetMasterPasswordPayload>();

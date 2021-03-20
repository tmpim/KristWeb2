// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createReducer, ActionType } from "typesafe-actions";
import { authMasterPassword, setMasterPassword } from "@actions/MasterPasswordActions";

export interface State {
  /** Whether or not the user has authenticated with the master password,
   * decrypting their wallets. */
  readonly isAuthed?: boolean;

  /** The master password used to encrypt and decrypt local storage data. */
  readonly masterPassword?: string;

  /** Secure random string that is encrypted with the master password to create
   * the "tester" string. */
  readonly salt?: string;
  /** The `salt` encrypted with the master password, to test the password is
   * correct. */
  readonly tester?: string;

  /** Whether or not the user has configured and saved a master password
   * before (whether or not salt+tester are present in local storage). */
  readonly hasMasterPassword?: boolean;
}

export function getInitialMasterPasswordState(): State {
  // Salt and tester from local storage (or undefined)
  const salt = localStorage.getItem("salt") || undefined;
  const tester = localStorage.getItem("tester") || undefined;

  // There is a master password configured if both `salt` and `tester` exist
  const hasMasterPassword = !!salt && !!tester;

  return {
    isAuthed: false,

    salt,
    tester,

    hasMasterPassword
  };
}

export const MasterPasswordReducer = createReducer({} as State)
  .handleAction(authMasterPassword, (state: State, action: ActionType<typeof authMasterPassword>) => ({
    ...state,
    isAuthed: true,
    masterPassword: action.payload.password
  }))
  .handleAction(setMasterPassword, (state: State, action: ActionType<typeof setMasterPassword>) => ({
    ...state,
    isAuthed: true,
    masterPassword: action.payload.password,
    salt: action.payload.salt,
    tester: action.payload.tester,
    hasMasterPassword: true
  }));

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@store";

import { toHex } from "@utils";
import { aesGcmEncrypt, aesGcmDecrypt } from "@utils/crypto";

import { store } from "@app";
import * as actions from "@actions/MasterPasswordActions";

import { TranslatedError } from "@utils/i18n";

/** Verifies that the given master password is correct, and dispatches the
 * auth action to the Redux store. */
export async function authMasterPassword(
  salt: string | undefined,
  tester: string | undefined,
  password: string
): Promise<void> {
  if (!password)
    throw new TranslatedError("masterPassword.errorPasswordRequired");
  if (!salt || !tester)
    throw new TranslatedError("masterPassword.errorPasswordUnset");

  try {
    // Attempt to decrypt the tester with the given password
    const testerDec = await aesGcmDecrypt(tester, password);

    // Verify that the decrypted tester is equal to the salt, if not, the
    // provided master password is incorrect.
    if (testerDec !== salt)
      throw new TranslatedError("masterPassword.errorPasswordIncorrect");
  } catch (e) {
    // OperationError usually means decryption failure
    if (e.name === "OperationError")
      throw new TranslatedError("masterPassword.errorPasswordIncorrect");
    else throw e;
  }

  // Dispatch the auth state changes to the Redux store
  store.dispatch(actions.authMasterPassword(password));
}

/** Generates a salt and tester, sets the master password, and dispatches the
 * action to the Redux store. */
export async function setMasterPassword(password: string): Promise<void> {
  if (!password)
    throw new TranslatedError("masterPassword.errorPasswordRequired");

  // Generate the salt (to be encrypted with the master password)
  const salt = window.crypto.getRandomValues(new Uint8Array(32));
  const saltHex = toHex(salt);

  // Generate the encryption tester
  const tester = await aesGcmEncrypt(saltHex, password);

  // Store them in local storage
  localStorage.setItem("salt", saltHex);
  localStorage.setItem("tester", tester);

  // Dispatch the auth state changes to the Redux store
  store.dispatch(actions.setMasterPassword(saltHex, tester, password));
}

interface MasterPasswordHookResponse {
  isAuthed?: boolean;
  masterPassword?: string;
  salt?: string;
  tester?: string;
  hasMasterPassword?: boolean;
}

/** Hook to return the master password state. */
export const useMasterPassword = (): MasterPasswordHookResponse =>
  useSelector((s: RootState) => s.masterPassword, shallowEqual);

/**
 * Hook to return just the master password. Used when the authed state is
 * already known (e.g. the component was rendered within an AuthorisedAction).
 */
export const useMasterPasswordOnly = (): string | undefined =>
  useSelector((s: RootState) => s.masterPassword.masterPassword);

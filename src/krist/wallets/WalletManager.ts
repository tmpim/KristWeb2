// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { toHex } from "../../utils";
import { aesGcmEncrypt, aesGcmDecrypt } from "../../utils/crypto";

import { AppDispatch } from "../../App";
import * as actions from "../../store/actions/WalletManagerActions";

/** Verifies that the given master password is correct, and dispatches the
 * auth action to the Redux store. */
export async function authMasterPassword(
  dispatch: AppDispatch,
  salt: string | undefined,
  tester: string | undefined,
  password: string
): Promise<void> {
  if (!password) throw new Error("masterPassword.errorPasswordRequired");
  if (!salt || !tester) throw new Error("masterPassword.errorPasswordUnset");

  try {
    // Attempt to decrypt the tester with the given password
    const testerDec = await aesGcmDecrypt(tester, password);

    // Verify that the decrypted tester is equal to the salt, if not, the
    // provided master password is incorrect.
    if (testerDec !== salt) throw new Error("masterPassword.errorPasswordIncorrect");
  } catch (e) {
    // OperationError usually means decryption failure
    if (e.name === "OperationError") throw new Error("masterPassword.errorPasswordIncorrect");
    else throw e;
  }

  // Load the private keys from the wallets, dispatching the updates to the
  // Redux store
  // TODO

  // Dispatch the auth state changes to the Redux store
  dispatch(actions.authMasterPassword(password));
}

/** Generates a salt and tester, sets the master password, and dispatches the
 * action to the Redux store. */
export async function setMasterPassword(dispatch: AppDispatch, password: string): Promise<void> {
  if (!password) throw new Error("masterPassword.errorPasswordRequired");

  // Generate the salt (to be encrypted with the master password)
  const salt = window.crypto.getRandomValues(new Uint8Array(32));
  const saltHex = toHex(salt);

  // Generate the encryption tester
  const tester = await aesGcmEncrypt(saltHex, password);

  // Store them in local storage
  localStorage.setItem("salt", saltHex);
  localStorage.setItem("tester", tester);

  // Dispatch the auth state changes to the Redux store
  dispatch(actions.setMasterPassword(saltHex, tester, password));
}

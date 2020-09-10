import { toHex } from "@utils";
import { aesGcmEncrypt, aesGcmDecrypt } from "@utils/crypto";

import { AppDispatch } from "./App";
import * as actions from "@actions/WalletManagerActions";

import Debug from "debug";
const debug = Debug("kristweb:walletManager");

export function browseAsGuest(dispatch: AppDispatch): void {
  dispatch(actions.browseAsGuest());
}

/** Verifies that the given password is correct, and dispatches the login
 * action to the Redux store. */
export async function login(dispatch: AppDispatch, salt: string | undefined, tester: string | undefined, password: string): Promise<void> {
  if (!password) throw new Error("Password is required.");
  if (!salt || !tester) throw new Error("Master password has not been set up.");

  try {
    // Attempt to decrypt the tester with the given password
    const testerDec = await aesGcmDecrypt(tester, password);

    // Verify that the decrypted tester is equal to the salt, if not, the
    // provided master password is incorrect.
    if (testerDec !== salt) throw new Error("Incorrect password.");
  } catch (e) {
    // OperationError usually means decryption failure
    if (e.name === "OperationError") throw new Error("Incorrect password.");
    else throw e;
  }

  // Dispatch the login state changes to the Redux store
  dispatch(actions.login(password));
}

/** Generates a salt and tester, sets the master password, and dispatches the
 * action to the Redux store. */
export async function setMasterPassword(dispatch: AppDispatch, password: string): Promise<void> {
  if (!password) throw new Error("Password is required.");

  // Generate the salt (to be encrypted with the master password)
  const salt = window.crypto.getRandomValues(new Uint8Array(32));
  const saltHex = toHex(salt);

  // Generate the encryption tester
  const tester = await aesGcmEncrypt(saltHex, password);

  debug("master password salt: %x    tester: %s", salt, tester);

  // Store them in local storage
  localStorage.setItem("salt", saltHex);
  localStorage.setItem("tester", tester);

  // Dispatch the login state changes to the Redux store
  dispatch(actions.setMasterPassword(saltHex, tester, password));
}

import React, { Component } from "react";

import { toHex } from "@utils";
import { aesGcmEncrypt, aesGcmDecrypt } from "@utils/crypto";

import { MasterPasswordDialog } from "./MasterPasswordDialog";

import Debug from "debug";
const debug = Debug("kristweb:walletManager");

type WalletManagerData = {
  /** Whether or not the user has logged in, either as a guest, or with a
   * master password. */
  isLoggedIn: boolean;

  /** Whether or not the user is browsing KristWeb as a guest. */
  isGuest: boolean;

  /** The master password used to encrypt and decrypt local storage data. */
  masterPassword?: string;
  
  /** Secure random string that is encrypted with the master password to create
   * the "tester" string. */
  salt?: string;
  /** The `salt` encrypted with the master password, to test the password is
   * correct. */
  tester?: string;

  /** Whether or not the user has configured and saved a master password
   * before (whether or not salt+tester are present in local storage). */
  hasMasterPassword: boolean;
}

export class WalletManager extends Component<unknown, WalletManagerData> {
  constructor(props: unknown) {
    super(props);

    // Check current data stored in local storage.
    const salt = localStorage.getItem("salt") || undefined;
    const tester = localStorage.getItem("tester") || undefined;

    this.state = {
      isLoggedIn: false,
      isGuest: true,

      // Salt and tester from local storage (or undefined)
      salt, tester,
      // There is a master password configured if both `salt` and `tester` exist
      hasMasterPassword: !!salt && !!tester
    };

    debug("hasMasterPassword: %b", this.state.hasMasterPassword);
  }

  async setMasterPassword(password: string): Promise<void> {
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

    // Set the logged in state
    this.setState({
      isLoggedIn: true,
      isGuest: false,
      masterPassword: password
    });
  }

  async testMasterPassword(password: string): Promise<void> {
    if (!password) throw new Error("Password is required.");

    // Get the salt and tester from local storage and ensure they exist
    const { salt, tester } = this.state;
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

    // Set the logged in state and don't return any errors (login successful)
    this.setState({
      isLoggedIn: true,
      isGuest: false,
      masterPassword: password
    });
  }

  /** Render the master password login/setup dialog */
  render(): JSX.Element | null {
    const { isLoggedIn, hasMasterPassword } = this.state;
    if (isLoggedIn) return null; // Don't show the dialog again

    return (
      <MasterPasswordDialog 
        hasMasterPassword={hasMasterPassword} // Show the setup dialog if needed
        walletManager={this} 
      />
    );
  }
}

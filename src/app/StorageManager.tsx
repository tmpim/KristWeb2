import React, { Component } from "react";

import { toHex } from "@utils";
import { aesGcmEncrypt, aesGcmDecrypt } from "@utils/crypto";

import { MasterPasswordDialog } from "./MasterPasswordDialog";
import { MasterPasswordSetupDialog } from "./MasterPasswordSetupDialog";

import Debug from "debug";
const debug = Debug("kristweb:storage");

type StorageManagerData = {
  /** Whether or not the user has logged in, either as a guest, or with a
   * master password. */
  isLoggedIn: boolean;

  /** Whether or not the user is browsing KristWeb as a guest. */
  isGuest: boolean;
  
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

export class StorageManager extends Component<unknown, StorageManagerData> {
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

    // Generate the encryption tester
    const tester = await aesGcmEncrypt(toHex(salt), password);

    debug("master password salt: %x    tester: %s", salt, tester);
  }

  /** Render the master password login/setup dialog */
  render(): JSX.Element | null {
    const { isLoggedIn, hasMasterPassword } = this.state;
    if (isLoggedIn) return null; // Don't show the dialog again

    if (hasMasterPassword) // Let the user log in with existing master password
      return <MasterPasswordDialog />;
    else // Have the user set a password up first
      return <MasterPasswordSetupDialog storageManager={this} />;
  }
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import * as api from ".";
import { AuthFailedError } from "@api/AuthFailed";

import { ValidDecryptedAddresses } from "@wallets";

import Debug from "debug";
const debug = Debug("kristweb:api-names");

export async function transferNames(
  decryptedAddresses: ValidDecryptedAddresses,
  names: { name: string; owner: string }[],
  recipient: string
): Promise<void> {
  for (const name of names) {
    const { privatekey } = decryptedAddresses[name.owner];

    try {
      debug("transferring name %s from %s to %s",
        name.name, name.owner, recipient);

      await api.post(
        `/names/${encodeURIComponent(name.name)}/transfer`,
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: recipient,
            privatekey
          })
        }
      );
    } catch (err) {
      // Convert auth_failed errors to AuthFailedError so the modal can display
      // the correct address
      if (err.message === "auth_failed")
        throw new AuthFailedError(err.message, name.owner);
      else
        throw err;
    }
  }
}

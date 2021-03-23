// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect } from "react";

import { BackupFormatType } from "@pages/backup/backupFormats";

import Debug from "debug";
const debug = Debug("kristweb:legacy-migration");

export function LegacyMigration(): JSX.Element | null {
  useEffect(() => {
    debug("checking legacy migration status");

    // Check if legacy migration has already been handled
    const legacyMigrated = localStorage.getItem("migrated");
    if (legacyMigrated === "2") {
      debug("migration already at 2, done");
      return;
    }

    // Check if there is a v1 master password in local storage
    const legacySalt = localStorage.getItem("salt") || undefined;
    const legacyTester = localStorage.getItem("tester") || undefined;
    const hasLegacyMasterPassword = !!legacySalt && !!legacyTester;
    if (!hasLegacyMasterPassword) {
      debug("no legacy master password, done");
      return;
    }

    // Check if there are any v1 wallets or contacts in local storage
    const walletIndex = localStorage.getItem("Wallet") || undefined;
    const contactIndex = localStorage.getItem("Friend") || undefined;
    if (!walletIndex && !contactIndex) {
      debug("no wallets or contacts, done");
      return;
    }

    // Fetch all the wallets and contacts, skipping over any that are missing
    const wallets: Record<string, string> = Object.fromEntries((walletIndex || "").split(",")
      .map(id => [`Wallet-${id}`, localStorage.getItem(`Wallet-${id}`)])
      .filter(([_, v]) => !!v));
    const contacts: Record<string, string> = Object.fromEntries((contactIndex || "").split(",")
      .map(id => [`Friend-${id}`, localStorage.getItem(`Friend-${id}`)])
      .filter(([_, v]) => !!v));
    debug("found %d wallets and %d contacts", Object.keys(wallets).length, Object.keys(contacts).length);

    // Construct the backup object prior to showing the modal
    const backup = {
      type: BackupFormatType.KRISTWEB_V1,
      wallets,
      friends: contacts
    };

    debug(backup);
  }, []);

  return null;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect } from "react";

import { BackupFormatType, BackupKristWebV1 } from "@pages/backup/backupFormats";
import { LegacyMigrationModal } from "./LegacyMigrationModal";

import Debug from "debug";
const debug = Debug("kristweb:legacy-migration");

const MIGRATION_CLEANUP_THRESHOLD = 7 * 24 * 60 * 60 * 1000;
const LEGACY_KEY_RE = /^(?:(?:Wallet|Friend)(?:-.+)?|salt|tester)$/;

// 7 days after a legacy migration, the old data can most likely now be removed
// from local storage.
function removeOldData() {
  debug("checking to remove old data");

  const migratedTime = localStorage.getItem("legacyMigratedTime");
  if (!migratedTime) {
    debug("no migrated time, done");
    return;
  }

  const t = new Date(migratedTime);
  const now = new Date();
  const diff = now.getTime() - t.getTime();
  debug("%d ms since migration", diff);

  if (diff <= MIGRATION_CLEANUP_THRESHOLD) {
    debug("migration threshold not enough time, done");
    return;
  }

  // Remove all the old data from local storage, including the old salt and
  // tester, the wallets, and the friends.
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && LEGACY_KEY_RE.test(key)) {
      // Push the keys to a queue to remove after looping, because otherwise
      // localStorage.length would change during iteration.
      debug("removing key %s", key);
      keysToRemove.push(key);
    }
  }

  // Now actually remove the keys
  keysToRemove.forEach(k => localStorage.removeItem(k));

  // Clean up legacyMigratedTime so this doesn't happen again
  localStorage.removeItem("legacyMigratedTime");

  debug("legacy migration cleanup done");
}

export function LegacyMigration(): JSX.Element | null {
  const [backup, setBackup] = useState<BackupKristWebV1>();

  // Check if a legacy migration needs to be performed
  useEffect(() => {
    debug("checking legacy migration status");

    // Check if legacy migration has already been handled
    const legacyMigrated = localStorage.getItem("migrated");
    if (legacyMigrated === "2") {
      debug("migration already at 2, done");
      removeOldData();
      return;
    }

    // Check if there is a v1 master password in local storage
    const salt = localStorage.getItem("salt") || undefined;
    const tester = localStorage.getItem("tester") || undefined;
    if (!salt || !tester) {
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
    const wallets = Object.fromEntries((walletIndex || "")
      .split(",")
      .map(id => [`Wallet-${id}`, localStorage.getItem(`Wallet-${id}`)])
      .filter(([_, v]) => !!v));
    const contacts = Object.fromEntries((contactIndex || "")
      .split(",")
      .map(id => [`Friend-${id}`, localStorage.getItem(`Friend-${id}`)])
      .filter(([_, v]) => !!v));
    debug("found %d wallets and %d contacts",
      Object.keys(wallets).length, Object.keys(contacts).length);

    // Construct the backup object prior to showing the modal
    const backup: BackupKristWebV1 = {
      type: BackupFormatType.KRISTWEB_V1,

      salt,
      tester,

      wallets,
      friends: contacts
    };

    setBackup(backup);
  }, []);

  return backup
    ? <LegacyMigrationModal
      backup={backup}
      setVisible={() => setBackup(undefined)}
    />
    : null;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Wallet } from "@wallets";
import { Contact } from "@contacts";

// The values here are the translation keys for the formats.
export enum BackupFormatType {
  KRISTWEB_V1 = "import.detectedFormatKristWebV1",
  KRISTWEB_V2 = "import.detectedFormatKristWebV2"
}

export interface Backup {
  // This value is inserted by `detectBackupFormat`.
  type: BackupFormatType;

  salt: string;
  tester: string;
}

// =============================================================================
// KristWeb v1
// =============================================================================

// https://github.com/tmpim/KristWeb/blob/696a402/src/js/wallet/model.js
export interface KristWebV1Wallet {
  address?: string;
  label?: string;
  icon?: string;
  username?: string;
  password?: string;
  masterkey?: string;
  format?: string;
  syncNode?: string;
  balance?: number;
  position?: number;
}

// https://github.com/tmpim/KristWeb/blob/696a402/src/js/friends/model.js
export interface KristWebV1Contact {
  address?: string;
  label?: string;
  icon?: string;
  isName?: boolean;
  syncNode?: string;
}

export interface BackupKristWebV1 extends Backup {
  type: BackupFormatType.KRISTWEB_V1;

  // KristWeb v1 backups contain a map of wallets, where the values are
  // encrypted JSON.
  wallets: Record<string, string>;
  friends: Record<string, string>;
}
export const isBackupKristWebV1 = (backup: Backup): backup is BackupKristWebV1 =>
  backup.type === BackupFormatType.KRISTWEB_V1;

// =============================================================================
// KristWeb v2
// =============================================================================

export type KristWebV2Wallet = Wallet;
export type KristWebV2Contact = Contact;

export interface BackupKristWebV2 extends Backup {
  type: BackupFormatType.KRISTWEB_V2;
  version: 2;

  wallets: Record<string, KristWebV2Wallet>;
  contacts: Record<string, KristWebV2Contact>;
}
export const isBackupKristWebV2 = (backup: Backup): backup is BackupKristWebV2 =>
  backup.type === BackupFormatType.KRISTWEB_V2;

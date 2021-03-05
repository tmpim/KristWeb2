// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Wallet } from "@wallets/Wallet";
import { WalletFormatName } from "@wallets/WalletFormat";

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

// https://github.com/tmpim/KristWeb/blob/696a402690cb4a317234ecd59ed85d7f03de1b70/src/js/wallet/model.js
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

export interface BackupKristWebV2 extends Backup {
  type: BackupFormatType.KRISTWEB_V2;
  version: 2;

  wallets: Record<string, KristWebV2Wallet>;
  // friends: Record<string, Friend>;
}
export const isBackupKristWebV2 = (backup: Backup): backup is BackupKristWebV2 =>
  backup.type === BackupFormatType.KRISTWEB_V2;

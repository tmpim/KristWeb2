// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Wallet } from "@wallets/Wallet";

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

export interface BackupKristWebV1 extends Backup {
  // KristWeb v1 backups contain a map of wallets, where the values are
  // encrypted JSON.
  wallets: Record<string, string>;
  friends: Record<string, string>;
}

export interface BackupKristWebV2 extends Backup {
  version: 2;

  wallets: Record<string, Wallet>;
  // friends: Record<string, Friend>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import {
  Backup, BackupFormatType,
  BackupKristWebV1, BackupKristWebV2
} from "./backupFormats";
import { decode } from "js-base64";

import { TranslatedError } from "@utils/i18n";

import { isPlainObject } from "lodash-es";

/** Detects a backup's format and decodes it. */
export function decodeBackup(rawData: string): Backup {
  try {
    // All backups are encoded as base64, so decode that first
    const plainData = decode(rawData);

    // Attempt to parse JSON
    const data = JSON.parse(plainData);

    // Check for required properties
    if (!data.tester)
      throw new TranslatedError("import.decodeErrors.missingTester");
    if (!data.salt)
      throw new TranslatedError("import.decodeErrors.missingSalt");
    if (typeof data.tester !== "string")
      throw new TranslatedError("import.decodeErrors.invalidTester");
    if (typeof data.salt !== "string")
      throw new TranslatedError("import.decodeErrors.invalidSalt");
    if (!isPlainObject(data.wallets))
      throw new TranslatedError("import.decodeErrors.invalidWallets");
    if (data.friends !== undefined && !isPlainObject(data.friends))
      throw new TranslatedError("import.decodeErrors.invalidFriends");
    if (data.contacts !== undefined && !isPlainObject(data.contacts))
      throw new TranslatedError("import.decodeErrors.invalidContacts");

    // Determine the format
    if (data.version === 2) {
      // KristWeb v2
      data.type = BackupFormatType.KRISTWEB_V2;
      return data as BackupKristWebV2;
    } else {
      // KristWeb v1
      data.type = BackupFormatType.KRISTWEB_V1;
      return data as BackupKristWebV1;
    }
  } catch (err) {
    // Invalid base64
    if (err instanceof DOMException && err.name === "InvalidCharacterError")
      throw new TranslatedError("import.decodeErrors.atob");

    // Invalid json
    if (err?.name === "SyntaxError")
      throw new TranslatedError("import.decodeErrors.json");

    throw err;
  }
}

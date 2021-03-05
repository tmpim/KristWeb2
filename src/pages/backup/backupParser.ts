// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import {
  BackupFormat, BackupFormatType,
  BackupFormatKristWebV1, BackupFormatKristWebV2
} from "./backupFormats";

import { TranslatedError } from "@utils/i18n";

import { isPlainObject } from "lodash-es";

export function detectBackupFormat(rawData: string): BackupFormat {
  try {
    // All backups are encoded as base64, so decode that first
    const plainData = window.atob(rawData);

    // Attempt to parse JSON
    const data = JSON.parse(plainData);

    // Check for required properties
    if (!data.tester)
      throw new TranslatedError("import.decodeErrors.missingTester");
    if (!data.salt)
      throw new TranslatedError("import.decodeErrors.missingSalt");
    if (!isPlainObject(data.wallets))
      throw new TranslatedError("import.decodeErrors.invalidWallets");
    if (data.friends !== undefined && !isPlainObject(data.friends))
      throw new TranslatedError("import.decodeErrors.invalidFriends");

    // Determine the format
    if (data.version === 2) {
      // KristWeb v2
      data.type = BackupFormatType.KRISTWEB_V2;
      return data as BackupFormatKristWebV2;
    } else {
      // KristWeb v1
      data.type = BackupFormatType.KRISTWEB_V1;
      return data as BackupFormatKristWebV1;
    }
  } catch (err) {
    // Invalid base64
    if (err instanceof DOMException && err.name === "InvalidCharacterError")
      throw new TranslatedError("import.decodeErrors.atob");

    // Invalid json
    if (err instanceof SyntaxError)
      throw new TranslatedError("import.decodeErrors.json");

    throw err;
  }
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
import { notification } from "antd";

import i18n from "@utils/i18n";

import Debug from "debug";
const debug = Debug("kristweb:settings-import-json");

function importLanguage(contents: string) {
  try {
    // Parse the imported language
    const resources = JSON.parse(contents);

    // Update the language
    i18n.addResourceBundle("und", "translation", resources, true, true);
    i18n.changeLanguage("und");

    notification.success({
      message: "Translation successfully imported.",
      description: "Language will be reset to English on next reload."
    });
  } catch (err) {
    console.error(err);
    if (err.name === "SyntaxError")
      return notification.error({ message: "Invalid JSON." });
    else
      return notification.error({ message: "Unknown error importing custom language." });
  }
}

export function importJSON(files?: FileList | null): void {
  // Note that any errors emitted by this function are intentionally left
  // untranslated. This is left as a precaution in case i18n breaks entirely.
  if (!files?.[0]) return;
  const file = files[0];

  debug("importing file %s: %o", file.name, file);

  // Disallow non-JSON files
  if (file.type !== "application/json") {
    notification.error({ message: "Not a JSON file." });
    return;
  }

  // Read the file
  const reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = e => {
    if (!e.target || !e.target.result) return;

    const contents = e.target.result.toString();
    debug("got file contents: %s", contents);

    importLanguage(contents);
  };
}

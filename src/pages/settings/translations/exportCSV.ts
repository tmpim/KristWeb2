// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import csvStringify from "csv-stringify";

import { AnalysedLanguage } from "./analyseLangs";

interface CSVRow {
  Code: string;
  Language?: string;
  Key: string;
  Value?: string;
}
export async function generateLanguageCSV(languages: AnalysedLanguage[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const en = languages.find(l => l.code === "en");
    if (!en) return reject("en missing");
    const enKeyNames = Object.keys(en.keys || {});

    // Merge all the languages and their keys together into one array
    const data = languages.reduce((out, lang) => {
      const { code, language, keys } = lang;
      if (code === "und" || !keys || !language) return out;
      const languageName = language.name;

      // Keys from both en and this language
      const combinedKeys = [...new Set([...enKeyNames, ...Object.keys(keys)])];
      // Find the value for this key from the language, or null if not
      const keysWithValues = combinedKeys.map(k => [k, keys[k]]);

      // Generate all the rows for this language
      return [
        ...out,
        ...keysWithValues.map(([k, v]) => ({
          "Code": code,
          "Language": languageName,
          "Key": k, "Value": v
        }))
      ];
    }, [] as CSVRow[]);

    csvStringify(data, { header: true, quoted: true }, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

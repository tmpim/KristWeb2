// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import JSON5 from "json5";

import { Language, getLanguages } from "@utils/i18n";

export interface LangKeys { [key: string]: string }
export interface AnalysedLanguage {
  code: string;
  language?: Language;

  error?: string;
  keys?: LangKeys;
  keyCount: number;
  missingKeys?: { k: string; v: string }[];
}

const IGNORE_KEYS = /_(?:plural|interval|male|female|\d+)$/;
export function analyseLanguage(
  code: string,
  language: Language | undefined,
  enKeys: Record<string, string> | undefined,
  translation: any
): AnalysedLanguage {
  const isObject = (val: any) => typeof val === "object" && !Array.isArray(val);
  const addDelimiter = (a: string, b: string) => a ? `${a}.${b}` : b;

  // Find all translation keys recursively
  const keys = (obj: any = {}, head = ""): LangKeys =>
    Object.entries(obj)
      .reduce((out, [key, value]) => {
        // Remove plural suffixes etc. These will be de-duplicated afterwards.
        const bareKey = key.replace(IGNORE_KEYS, "");

        const fullPath = addDelimiter(head, bareKey);
        return isObject(value as any)
          ? { ...out, ...keys(value, fullPath) }
          : {...out, [fullPath]: value };
      }, {});

  const langKeys = keys(translation);

  return {
    code,
    language,
    keys: langKeys,
    keyCount: Object.keys(langKeys).length,
    missingKeys: enKeys
      ? Object.entries(enKeys)
        .filter(([k]) => !langKeys[k])
        .map(([k, v]) => ({ k, v }))
      : []
  };
}

export async function getEnglishData(): Promise<AnalysedLanguage> {
  const languages = getLanguages();
  // Fetch and analyse the data for English first
  const enLang = languages!["en"];
  const enData = await getLanguageData("en");
  const en = analyseLanguage("en", enLang, undefined, enData);
  return en;
}

export interface AnalysedLanguages {
  enKeyCount: number;
  languages: AnalysedLanguage[];
}

export async function analyseLanguages(): Promise<AnalysedLanguages | false> {
  const languages = getLanguages();
  if (!languages) return false;

  // Fetch and analyse the data for English first
  const en = await getEnglishData();

  // Fetch the locale file for each language code
  const langEntries = Object.entries(languages);
  langEntries.sort((a, b) => a[1].name.localeCompare(b[1].name));
  const languageData = await Promise.allSettled(
    langEntries.map(e => getLanguageData(e[0]))
  );

  return {
    enKeyCount: en.keyCount,
    // If a language couldn't be fetched, show an error for it instead
    languages: languageData.map((result, i) => result.status === "fulfilled"
      ? analyseLanguage(
        langEntries[i][0],
        langEntries[i][1],
        en.keys,
        result.value
      )
      : {
        code: langEntries[i][0],
        language: langEntries[i][1],
        keyCount: 0,
        error: result.reason.toString()
      })
  };
}

// Replaced by webpack DefinePlugin and git-revision-webpack-plugin
declare const __GIT_VERSION__: string;
const gitVersion: string = __GIT_VERSION__;
async function getLanguageData(code: string): Promise<any> {
  const res = await fetch(`/locales/${code}.json?v=${encodeURIComponent(gitVersion)}`);
  if (!res.ok) throw new Error(res.statusText);

  // Translations now use JSON5 to allow for comments, newlines, and basic
  // syntax errors like trailing commas
  const data = await res.text();
  return JSON5.parse(data);
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Language, getLanguages } from "@utils/i18n";

export interface LangKeys { [key: string]: string }
export interface AnalysedLanguage {
  code: string;
  language: Language;

  error?: string;
  keys?: LangKeys;
  keyCount: number;
  missingKeys?: { k: string; v: string }[];
}

const IGNORE_KEYS = /_(?:plural|interval|male|female|\d+)$/;
export async function getLanguage([code, language]: [string, Language]): Promise<AnalysedLanguage> {
  const res = await fetch(`/locales/${code}.json`);
  if (!res.ok) throw new Error(res.statusText);

  const translation = await res.json();

  const isObject = (val: any) => typeof val === "object" && !Array.isArray(val);
  const addDelimiter = (a: string, b: string) => a ? `${a}.${b}` : b;

  // Find all translation keys recursively
  const keys = (obj: any = {}, head = ""): LangKeys =>
    Object.entries(obj)
      .reduce((product, [key, value]) => {
        // Ignore plurals, etc.
        if (IGNORE_KEYS.test(key)) return product;

        const fullPath = addDelimiter(head, key);
        return isObject(value as any)
          ? { ...product, ...keys(value, fullPath) }
          : {...product, [fullPath]: value };
      }, {});

  const langKeys = keys(translation);

  return { code, language, keys: langKeys, keyCount: Object.keys(langKeys).length };
}

export interface AnalysedLanguages {
  enKeyCount: number;
  languages: AnalysedLanguage[];
}

export async function analyseLanguages(): Promise<AnalysedLanguages | false> {
  const languages = getLanguages();
  if (!languages) return false;

  // Fetch the locale file for each language code
  const codes = Object.entries(languages);
  const languageData = await Promise.allSettled(codes.map(getLanguage));

  const en = languageData.find(l => l.status === "fulfilled" && l.value.code === "en");
  const enKeys = en?.status === "fulfilled" ? en?.value.keys || {} : {};
  const enKeyCount = enKeys ? Object.keys(enKeys).length : 1;

  return {
    enKeyCount,
    languages: languageData.map((result, i) => result.status === "fulfilled"
      ? {
        code: codes[i][0],
        language: codes[i][1],
        keys: result.value.keys,
        keyCount: result.value.keyCount,
        missingKeys: result.value.keys
          ? Object.entries(enKeys)
            .filter(([k]) => result.value.keys && !result.value.keys[k])
            .map(([k, v]) => ({ k, v }))
          : []
      }
      : { code: codes[i][0], language: codes[i][1], keyCount: 0, error: result.reason.toString() })
  };
}

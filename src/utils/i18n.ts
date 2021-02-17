import { isLocalhost } from "./";

import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import languagesJson from "../__data__/languages.json";
import packageJson from "../../package.json";

export interface Language {
  name: string;
  nativeName?: string;
  country?: string;
  contributors: Contributor[];
}

export interface Contributor {
  name: string;
  url?: string;
}

export function getLanguages(): { [key: string]: Language } | null {
  return languagesJson;
}

// Provided as a testing polyfill
/*const DEFAULT_LANGUAGE = { "en": {
  "name": "English (GB)",
  "country": "GB",
  "contributors": []
}};*/

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: Object.keys(getLanguages() || { "en": {} }),

    debug: isLocalhost,

    keySeparator: ".",

    interpolation: {
      escapeValue: false // React already safes from XSS
    },

    backend: {
      queryStringParams: { v: packageJson.version },
      loadPath: "/locales/{{lng}}.json"
    }
  });

export default i18n;

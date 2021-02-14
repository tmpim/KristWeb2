import { isLocalhost } from "./";

import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import packageJson from "../../package.json";

// Find languages.json
const req = require.context("../../", false, /\.\/languages.json$/);

export interface Language {
  name: string;
  nativeName?: string;
  country?: string;
  contributors: Contributor[];
};

export interface Contributor {
  name: string;
  url?: string;
}

export function getLanguages(): { [key: string]: Language } | null {
  if (!req.keys().includes("./languages.json")) return null;
  return req("./languages.json");
}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "de", "ja", "vi", "fr"],

    debug: isLocalhost,

    keySeparator: ".",

    interpolation: {
      escapeValue: false // React already safes from XSS
    },

    backend: {
      queryStringParams: { v: packageJson.version }
    }
  });

export default i18n;

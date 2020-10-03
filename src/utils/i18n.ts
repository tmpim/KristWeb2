import { isLocalhost } from "./";

import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import packageJson from "@/package.json";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "de", "ja", "vi"],

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

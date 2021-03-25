// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { notification } from "antd";

import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

import { initReactI18next } from "react-i18next";

import JSON5 from "json5";

import { isLocalhost } from "..";
import { getLanguages } from "./languages";

// Replaced by webpack DefinePlugin and git-revision-webpack-plugin
declare const __GIT_VERSION__: string;
const gitVersion: string = __GIT_VERSION__;

export const i18nLoader = i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: [...Object.keys(getLanguages() || { "en": {} }), "und"],

    debug: isLocalhost,

    keySeparator: ".",

    interpolation: {
      escapeValue: false, // React already safes from XSS

      format(value, format) {
        // Format numbers with commas
        if (format === "number" && typeof value === "number")
          return value.toLocaleString();

        return value;
      }
    },

    backend: {
      queryStringParams: { v: encodeURIComponent(gitVersion) },
      loadPath: "/locales/{{lng}}.json",

      // Translations now use JSON5 to allow for comments, newlines, and basic
      // syntax errors like trailing commas
      parse: data => JSON5.parse(data)
    }
  })
  .then(() => {
    // If the language was set to a custom debug language, reset it
    if (i18n.language === "und") {
      i18n.changeLanguage("en");
      // Intentionally untranslated
      notification.info({
        message: "Language reverted to English.",
        description: "You were previously using a custom debug translation."
      });
    }
  });

export default i18n;

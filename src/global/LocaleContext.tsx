// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC, useEffect } from "react";
import { ConfigProvider } from "antd";
import { Locale } from "antd/lib/locale-provider";
import localeValues from "antd/lib/locale/default";

import { useTranslation } from "react-i18next";
import { getLanguages } from "@utils/i18n";

import dayjs from "dayjs";

import Debug from "debug";
const debug = Debug("kristweb:locale-context");

export const LocaleContext: FC = ({ children }): JSX.Element => {
  const { t, i18n } = useTranslation();
  const langCode = i18n.language;
  const languages = getLanguages();

  // Load the day.js locale if available
  useEffect(() => {
    if (!languages) return;
    const lang = languages[langCode];

    // See if the language has a dayjs locale set. If not, revert to `en`
    const dayjsLocale = lang?.dayjsLocale;
    if (!dayjsLocale) {
      debug("language %s doesn't have a dayjs locale, reverting to `en`", langCode);
      dayjs.locale("en");
      return;
    }

    // Attempt to import the locale asynchronously. This will usually incur a
    // network request, but it should be cached by the service worker.
    debug("loading dayjs locale %s for language %s", dayjsLocale, langCode);
    // Including only `.js` files here ensures that it doesn't attempt to load
    // the TypeScript typings, which causes build warnings due to a missing
    // loader for those files.
    import(
      /* webpackInclude: /\.js$/ */
      /* webpackMode: "lazy" */
      /* webpackChunkName: "locale-dayjs-[request]" */
      `dayjs/locale/${dayjsLocale}`
    )
      .then(() => {
        debug("got dayjs locale %s", dayjsLocale);
        dayjs.locale(dayjsLocale);
      })
      .catch(console.error);
  }, [langCode, languages]);

  return <ConfigProvider>
    {children}
  </ConfigProvider>;
};

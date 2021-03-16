// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import languagesJson from "../../__data__/languages.json";

export interface Language {
  name: string;
  nativeName?: string;
  country?: string;
  dayjsLocale?: string;
  timeagoLocale?: string;
  antLocale?: string;
  contributors: Contributor[];
}

export interface Contributor {
  name: string;
  url?: string;
}

export type Languages = { [key: string]: Language } | null;
export function getLanguages(): Languages {
  return languagesJson;
}

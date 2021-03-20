// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { i18n } from "i18next";
import { useTranslation, TFunction } from "react-i18next";
import { TranslatedError } from "./errors";

export type TKeyFn = (key: string) => string;
export type TStrFn = (key: string) => string;
export type TErrFn = (key: string) => TranslatedError;
export interface TFns {
  t: TFunction;
  tKey: TKeyFn;
  tStr: TStrFn;
  tErr: TErrFn;
  i18n: i18n;
}
export function useTranslationFns(prefix?: string): TFns {
  const { t, i18n } = useTranslation();
  const tKey = (key: string) => prefix + key;
  const tStr = (key: string) => t(tKey(key));
  const tErr = (key: string) => new TranslatedError(tKey(key));

  return { t, tKey, tStr, tErr, i18n };
}
export const useTFns = useTranslationFns;

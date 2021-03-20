// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { TFunction } from "react-i18next";

export class TranslatedError extends Error {
  constructor(message: string) { super(message); }
}

export function translateError(t: TFunction, error: Error, unknownErrorKey?: string): string {
  if (error instanceof TranslatedError) {
    return t(error.message);
  } else {
    return unknownErrorKey ? t(unknownErrorKey) : error.message;
  }
}

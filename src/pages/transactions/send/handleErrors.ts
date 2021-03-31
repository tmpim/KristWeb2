// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { TranslatedError } from "@utils/i18n";

import { APIError } from "@api";
import { ShowAuthFailedFn } from "@api/AuthFailed";

import { Wallet } from "@wallets";

export function handleTransactionError(
  onError: ((error: Error) => void) | undefined,
  showAuthFailed: ShowAuthFailedFn,
  err: Error,
  from?: Wallet
): void {
  // Construct a TranslatedError pre-keyed to sendTransaction
  const tErr = (key: string) => new TranslatedError("sendTransaction." + key);

  switch (err.message) {
  case "missing_parameter":
  case "invalid_parameter":
    switch ((err as APIError).parameter) {
    case "to":
      return onError?.(tErr("errorParameterTo"));
    case "amount":
      return onError?.(tErr("errorParameterAmount"));
    case "metadata":
      return onError?.(tErr("errorParameterMetadata"));
    }
    break;
  case "insufficient_funds":
    return onError?.(tErr("errorInsufficientFunds"));
  case "name_not_found":
    return onError?.(tErr("errorNameNotFound"));
  case "auth_failed":
    return showAuthFailed(from!);
  }

  // Pass through any other unknown errors
  onError?.(err);
}

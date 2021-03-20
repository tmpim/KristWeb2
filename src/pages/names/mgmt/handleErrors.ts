// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { notification } from "antd";

import { translateError, TFns } from "@utils/i18n";

import { APIError } from "@api";
import { AuthFailedError, ShowAuthFailedFn } from "@api/AuthFailed";

import { WalletAddressMap, Wallet } from "@wallets";

// Convert API errors to friendlier errors
export async function handleEditError(
  { t, tKey, tStr, tErr }: TFns,
  showAuthFailed: ShowAuthFailedFn,
  walletAddressMap: WalletAddressMap,
  err: Error
): Promise<void> {
  const onError = (err: Error) => notification.error({
    message: tStr("errorNotificationTitle"),
    description: translateError(t, err, tKey("errorUnknown"))
  });

  switch (err.message) {
  case "missing_parameter":
  case "invalid_parameter":
    switch ((err as APIError).parameter) {
    case "name":
      return onError(tErr("errorParameterNames"));
    case "address":
      return onError(tErr("errorParameterRecipient"));
    case "a":
      return onError(tErr("errorParameterARecord"));
    }
    break;
  case "name_not_found":
    return onError(tErr("errorNameNotFound"));
  case "not_name_owner":
    return onError(tErr("errorNotNameOwner"));
  case "auth_failed":
    return showAuthFailed(walletAddressMap[(err as AuthFailedError).address!]);
  }

  // Pass through any other unknown errors
  console.error(err);
  onError(err);
}

export async function handlePurchaseError(
  { t, tKey, tStr, tErr }: TFns,
  showAuthFailed: ShowAuthFailedFn,
  wallet: Wallet,
  err: Error
): Promise<void> {
  const onError = (err: Error) => notification.error({
    message: tStr("errorNotificationTitle"),
    description: translateError(t, err, tKey("errorUnknown"))
  });

  switch (err.message) {
  case "missing_parameter":
  case "invalid_parameter":
    return onError(tErr("errorInvalidName"));
  case "name_taken":
    return onError(tErr("errorNameTaken"));
  case "insufficient_funds":
    return onError(tErr("errorInsufficientFunds"));
  case "auth_failed":
    return showAuthFailed(wallet);
  }

  // Pass through any other unknown errors
  console.error(err);
  onError(err);
}

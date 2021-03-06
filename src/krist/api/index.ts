// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { notification } from "antd";
import i18n from "@utils/i18n";

import { useSelector } from "react-redux";
import { RootState } from "@store";
import { store } from "@app";

import { APIResponse } from "./types";
import { throttle } from "lodash-es";

export class APIError extends Error {
  constructor(message: string, public parameter?: string) {
    super(message);
  }
}

export class RateLimitError extends APIError {
  constructor() { super("rate_limit_hit"); }
}

// Realistically, the only situation in which a rate limit will actually be hit
// by KristWeb is if an infinite loop is introduced (e.g. via useEffect), so we
// would want to avoid spamming notifications and making the performance bug
// worse, therefore this notification is throttled to 5 seconds.
const _notifyRateLimit = () =>
  notification.error({ message: i18n.t("rateLimitTitle"), description: i18n.t("rateLimitDescription") });
const notifyRateLimit = throttle(_notifyRateLimit, 5000);

interface RequestOptions extends RequestInit {
  /** Suppresses the notification for a rate limited request. An error will
   * still be thrown. */
  ignoreRateLimit?: boolean;
}

export async function request<T>(method: string, endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> {
  const syncNode = store.getState().node.syncNode;

  // Let the fetch bubble its error upwards
  const res = await fetch(syncNode + "/" + endpoint.replace(/^\//, ""), {
    method,
    ...options
  });

  if (res.status === 429) {
    if (!options?.ignoreRateLimit) notifyRateLimit();
    throw new RateLimitError();
  }

  const data: APIResponse<T> = await res.json();
  if (!data.ok || data.error)
    throw new APIError(data.error || "unknown_error", data.parameter);

  return data;
}

export const get = <T>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> =>
  request("GET", endpoint, options);
export const post = <T>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> =>
  request("POST", endpoint, options);

/** Re-usable syncNode hook, usually for refreshing things when the syncNode
 * changes. */
export const useSyncNode = (): string => useSelector((s: RootState) => s.node.syncNode);

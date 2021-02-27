import { notification } from "antd";
import i18n from "../../utils/i18n";

import { APIResponse } from "./types";
import { throttle } from "lodash-es";

export class APIError extends Error {
  constructor(message: string, public parameter?: string) {
    super(message);
  }
}

// Realistically, the only situation in which a rate limit will actually be hit
// by KristWeb is if an infinite loop is introduced (e.g. via useEffect), so we
// would want to avoid spamming notifications and making the performance bug
// worse, therefore this notification is throttled to 5 seconds.
const _notifyRateLimit = () =>
  notification.error({ message: i18n.t("rateLimitTitle"), description: i18n.t("rateLimitDescription") });
const notifyRateLimit = throttle(_notifyRateLimit, 5000);

export async function request<T>(syncNode: string, method: string, endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
  // Let the fetch bubble its error upwards
  const res = await fetch(syncNode + "/" + endpoint, {
    method,
    ...options
  });

  if (res.status === 429) {
    notifyRateLimit();
    throw new APIError("rate_limit_hit");
  }

  const data: APIResponse<T> = await res.json();
  if (!data.ok || data.error)
    throw new APIError(data.error || "unknown_error", data.parameter);

  return data;
}

export const get = <T>(syncNode: string, endpoint: string, options?: RequestInit): Promise<APIResponse<T>> =>
  request(syncNode, "GET", endpoint, options);
export const post = <T>(syncNode: string, endpoint: string, options?: RequestInit): Promise<APIResponse<T>> =>
  request(syncNode, "POST", endpoint, options);

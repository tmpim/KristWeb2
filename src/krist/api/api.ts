import { APIResponse } from "./types";

export class APIError extends Error {
  constructor(message: string, public parameter?: string) {
    super(message);
  }
}

export async function request<T>(syncNode: string, method: string, endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
  // Let the fetch bubble its error upwards
  const res = await fetch(syncNode + "/" + endpoint, {
    method,
    ...options
  });

  const data: APIResponse<T> = await res.json();
  if (!data.ok || data.error)
    throw new APIError(data.error || "unknown_error", data.parameter);

  return data;
}

export const get = <T>(syncNode: string, endpoint: string, options?: RequestInit): Promise<APIResponse<T>> =>
  request(syncNode, "GET", endpoint, options);
export const post = <T>(syncNode: string, endpoint: string, options?: RequestInit): Promise<APIResponse<T>> =>
  request(syncNode, "POST", endpoint, options);

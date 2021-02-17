import { APIResponse, KristAddress } from "./types";

import packageJson from "../../../package.json";

interface LookupAddressesResponse {
  found: number;
  notFound: number;
  addresses: Record<string, KristAddress | null>;
}

export interface KristAddressWithNames extends KristAddress { names?: number }
export type LookupResults = Record<string, KristAddressWithNames | null>;

export async function lookupAddresses(addresses: string[], fetchNames?: boolean): Promise<LookupResults> {
  if (!addresses || addresses.length === 0) return {};

  const syncNode = packageJson.defaultSyncNode; // TODO: support alt nodes

  try {
    const res = await fetch(
      syncNode
      + "/lookup/addresses/"
      + encodeURIComponent(addresses.join(","))
      + (fetchNames ? "?fetchNames" : "")
    );
    if (!res.ok || res.status !== 200) throw new Error(res.statusText);

    const data: APIResponse<LookupAddressesResponse> = await res.json();
    if (!data.ok || data.error) throw new Error(data.error);

    return data.addresses;
  } catch (err) {
    // TODO: proper error handling function for API requests
    console.error(err);
  }

  return {};
}

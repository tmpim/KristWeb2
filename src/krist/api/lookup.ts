// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { APIResponse, KristAddress, KristTransaction } from "./types";

interface LookupAddressesResponse {
  found: number;
  notFound: number;
  addresses: Record<string, KristAddress | null>;
}

export interface KristAddressWithNames extends KristAddress { names?: number }
export type AddressLookupResults = Record<string, KristAddressWithNames | null>;

export async function lookupAddresses(syncNode: string, addresses: string[], fetchNames?: boolean): Promise<AddressLookupResults> {
  if (!addresses || addresses.length === 0) return {};

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

interface LookupTransactionsOptions {
  includeMined?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: "id" | "from" | "to" | "value" | "time";
  order?: "ASC" | "DESC";
}

export interface LookupTransactionsResponse {
  count: number;
  total: number;
  transactions: KristTransaction[];
}

export async function lookupTransactions(syncNode: string, addresses: string[], opts: LookupTransactionsOptions): Promise<LookupTransactionsResponse> {
  if (!addresses || addresses.length === 0) return { count: 0, total: 0, transactions: [] };

  const qs = new URLSearchParams();
  if (opts.includeMined) qs.append("includeMined", "");
  if (opts.limit) qs.append("limit", opts.limit.toString());
  if (opts.offset) qs.append("offset", opts.offset.toString());
  if (opts.orderBy) qs.append("orderBy", opts.orderBy);
  if (opts.order) qs.append("order", opts.order);

  const res = await fetch(
    syncNode
    + "/lookup/transactions/"
    + encodeURIComponent(addresses.join(","))
    + "?" + qs
  );
  if (!res.ok || res.status !== 200) throw new Error(res.statusText);

  const data: APIResponse<LookupTransactionsResponse> = await res.json();
  if (!data.ok || data.error) throw new Error(data.error);

  return data;
}

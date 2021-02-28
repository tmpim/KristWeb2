// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { KristAddress, KristTransaction } from "./types";
import * as api from ".";

interface LookupAddressesResponse {
  found: number;
  notFound: number;
  addresses: Record<string, KristAddress | null>;
}

export interface KristAddressWithNames extends KristAddress { names?: number }
export type AddressLookupResults = Record<string, KristAddressWithNames | null>;

export async function lookupAddresses(addresses: string[], fetchNames?: boolean): Promise<AddressLookupResults> {
  if (!addresses || addresses.length === 0) return {};

  try {
    const data = await api.get<LookupAddressesResponse>(
      "lookup/addresses/"
      + encodeURIComponent(addresses.join(","))
      + (fetchNames ? "?fetchNames" : "")
    );

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

export async function lookupTransactions(addresses: string[], opts: LookupTransactionsOptions): Promise<LookupTransactionsResponse> {
  if (!addresses || addresses.length === 0) return { count: 0, total: 0, transactions: [] };

  const qs = new URLSearchParams();
  if (opts.includeMined) qs.append("includeMined", "");
  if (opts.limit) qs.append("limit", opts.limit.toString());
  if (opts.offset) qs.append("offset", opts.offset.toString());
  if (opts.orderBy) qs.append("orderBy", opts.orderBy);
  if (opts.order) qs.append("order", opts.order);

  return await api.get<LookupTransactionsResponse>(
    "lookup/transactions/"
    + encodeURIComponent(addresses.join(","))
    + "?" + qs
  );
}

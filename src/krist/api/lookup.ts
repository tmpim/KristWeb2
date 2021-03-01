// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { KristAddress, KristTransaction, KristName } from "./types";
import * as api from ".";

// =============================================================================
// Addresses
// =============================================================================
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

/** Uses the lookup API to retrieve a single address. */
export async function lookupAddress(address: string, fetchNames?: boolean): Promise<KristAddressWithNames> {
  const data = await api.get<LookupAddressesResponse>(
    "lookup/addresses/"
    + encodeURIComponent(address)
    + (fetchNames ? "?fetchNames" : "")
  );

  const kristAddress = data.addresses[address];
  if (!kristAddress) throw new api.APIError("address_not_found");

  return kristAddress;
}

// =============================================================================
// Transactions
// =============================================================================
export type SortableTransactionFields = "id" | "from" | "to" | "value" | "time"
  | "sent_name" | "sent_metaname";
export interface LookupTransactionsOptions {
  includeMined?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: SortableTransactionFields;
  order?: "ASC" | "DESC";
}

export interface LookupTransactionsResponse {
  count: number;
  total: number;
  transactions: KristTransaction[];
}

export async function lookupTransactions(addresses: string[] | undefined, opts: LookupTransactionsOptions): Promise<LookupTransactionsResponse> {
  const qs = new URLSearchParams();
  if (opts.includeMined) qs.append("includeMined", "");
  if (opts.limit) qs.append("limit", opts.limit.toString());
  if (opts.offset) qs.append("offset", opts.offset.toString());
  if (opts.orderBy) qs.append("orderBy", opts.orderBy);
  if (opts.order) qs.append("order", opts.order);

  return await api.get<LookupTransactionsResponse>(
    "lookup/transactions/"
    + (addresses && addresses.length > 0
      ? encodeURIComponent(addresses.join(","))
      : "")
    + "?" + qs
  );
}

// =============================================================================
// Names
// =============================================================================
export type SortableNameFields = "name" | "owner" | "original_owner"
  | "registered" | "updated" | "a" | "unpaid";
export interface LookupNamesOptions {
  limit?: number;
  offset?: number;
  orderBy?: SortableNameFields;
  order?: "ASC" | "DESC";
}

export interface LookupNamesResponse {
  count: number;
  total: number;
  names: KristName[];
}

export async function lookupNames(addresses: string[], opts: LookupNamesOptions): Promise<LookupNamesResponse> {
  if (!addresses || addresses.length === 0) return { count: 0, total: 0, names: [] };

  const qs = new URLSearchParams();
  if (opts.limit) qs.append("limit", opts.limit.toString());
  if (opts.offset) qs.append("offset", opts.offset.toString());
  if (opts.orderBy) qs.append("orderBy", opts.orderBy);
  if (opts.order) qs.append("order", opts.order);

  return await api.get<LookupNamesResponse>(
    "lookup/names/"
    + encodeURIComponent(addresses.join(","))
    + "?" + qs
  );
}

export function convertSorterOrder(order: "descend" | "ascend" | null | undefined): "ASC" | "DESC" | undefined {
  switch (order) {
  case "ascend":
    return "ASC";
  case "descend":
    return "DESC";
  }
}

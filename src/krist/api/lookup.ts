// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { KristAddress, KristTransaction, KristName, KristBlock } from "./types";
import * as api from ".";

import { LookupFilterOptionsBase, LookupResponseBase, getFilterOptionsQuery } from "@utils/table";

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

export async function lookupAddresses(
  addresses: string[],
  fetchNames?: boolean
): Promise<AddressLookupResults> {
  if (!addresses || addresses.length === 0) return {};

  try {
    const data = await api.get<LookupAddressesResponse>(
      "lookup/addresses/"
      + encodeURIComponent(addresses.join(","))
      + (fetchNames ? "?fetchNames" : "")
    );

    return data.addresses;
  } catch (err) {
    console.error(err);
  }

  return {};
}

/** Uses the lookup API to retrieve a single address. */
export async function lookupAddress(
  address: string,
  fetchNames?: boolean
): Promise<KristAddressWithNames> {
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
// Blocks
// =============================================================================
export type SortableBlockFields = "height" | "address" | "hash" | "value" |
  "time" | "difficulty";
export type LookupBlocksOptions = LookupFilterOptionsBase<SortableBlockFields>;

export interface LookupBlocksResponse extends LookupResponseBase {
  blocks: KristBlock[];
}

export async function lookupBlocks(
  opts: LookupBlocksOptions
): Promise<LookupBlocksResponse> {
  const qs = getFilterOptionsQuery(opts);
  return await api.get<LookupBlocksResponse>("lookup/blocks?" + qs);
}

// =============================================================================
// Transactions
// =============================================================================
export type SortableTransactionFields = "id" | "from" | "to" | "value" | "time"
  | "sent_name" | "sent_metaname";

export enum LookupTransactionType {
  TRANSACTIONS,
  NAME_HISTORY,
  NAME_TRANSACTIONS,
  SEARCH,
}

export interface LookupTransactionsOptions extends LookupFilterOptionsBase<SortableTransactionFields> {
  includeMined?: boolean;
  type?: LookupTransactionType;
  searchType?: "address" | "name" | "metadata";
}

export interface LookupTransactionsResponse extends LookupResponseBase {
  transactions: KristTransaction[];
}

/** Maps a transaction lookup type to its appropriate API endpoint. */
function getTransactionLookupRoute(
  addresses: string[] | undefined,
  opts: LookupTransactionsOptions
): string {
  // Combine an address array into comma-separated values
  const addressList = addresses && addresses.length > 0
    ? encodeURIComponent(addresses.join(","))
    : "";

  switch (opts.type ?? LookupTransactionType.TRANSACTIONS) {
  case LookupTransactionType.TRANSACTIONS:
    return "lookup/transactions/" + addressList;
  case LookupTransactionType.NAME_HISTORY:
    return "lookup/names/" + addressList + "/history";
  case LookupTransactionType.NAME_TRANSACTIONS:
    return "lookup/names/" + addressList + "/transactions";
  case LookupTransactionType.SEARCH:
    return "search/extended/results/transactions/" + opts.searchType;
  }
}

export async function lookupTransactions(
  addresses: string[] | undefined,
  opts: LookupTransactionsOptions
): Promise<LookupTransactionsResponse> {
  const qs = getFilterOptionsQuery(opts);
  if (opts.includeMined) qs.append("includeMined", "");

  const type = opts.type ?? LookupTransactionType.TRANSACTIONS;
  const route = getTransactionLookupRoute(addresses, opts);

  // For searches, append the search query as a query parameter
  if (type === LookupTransactionType.SEARCH)
    qs.append("q", addresses?.[0] || "");

  return await api.get<LookupTransactionsResponse>(route + "?" + qs);
}

// =============================================================================
// Names
// =============================================================================
export type SortableNameFields = "name" | "owner" | "original_owner"
  | "registered" | "updated" | "a" | "unpaid";
export type LookupNamesOptions = LookupFilterOptionsBase<SortableNameFields>;

export interface LookupNamesResponse extends LookupResponseBase {
  names: KristName[];
}

export async function lookupNames(
  addresses: string[] | undefined,
  opts: LookupNamesOptions
): Promise<LookupNamesResponse> {
  const qs = getFilterOptionsQuery(opts);
  return await api.get<LookupNamesResponse>(
    "lookup/names/"
    + (addresses && addresses.length > 0
      ? encodeURIComponent(addresses.join(","))
      : "")
    + "?" + qs
  );
}

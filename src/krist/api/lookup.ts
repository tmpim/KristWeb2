// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { KristAddress, KristTransaction, KristName, KristBlock } from "./types";
import * as api from ".";

import { LookupFilterOptionsBase, LookupResultsBase, getFilterOptionsQuery } from "../../utils/table";

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
// Blocks
// =============================================================================
export type SortableBlockFields = "height" | "address" | "hash" | "value" |
  "time" | "difficulty";
export type LookupBlocksOptions = LookupFilterOptionsBase<SortableBlockFields>;

export interface LookupBlocksResponse extends LookupResultsBase {
  blocks: KristBlock[];
}

export async function lookupBlocks(opts: LookupBlocksOptions): Promise<LookupBlocksResponse> {
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
  NAME_TRANSACTIONS
}

export interface LookupTransactionsOptions extends LookupFilterOptionsBase<SortableTransactionFields> {
  includeMined?: boolean;
  type?: LookupTransactionType;
}

export interface LookupTransactionsResponse extends LookupResultsBase {
  transactions: KristTransaction[];
}

export async function lookupTransactions(addresses: string[] | undefined, opts: LookupTransactionsOptions): Promise<LookupTransactionsResponse> {
  const qs = getFilterOptionsQuery(opts);
  if (opts.includeMined) qs.append("includeMined", "");

  // Map the lookup type to the appropriate route
  // TODO: this is kinda wack
  const type = opts.type ?? LookupTransactionType.TRANSACTIONS;
  const route = type === LookupTransactionType.TRANSACTIONS
    ? "transactions" : "names";
  const routeExtra = type !== LookupTransactionType.TRANSACTIONS
    ? (type === LookupTransactionType.NAME_HISTORY
      ? "/history"
      : "/transactions")
    : "";

  return await api.get<LookupTransactionsResponse>(
    `lookup/${route}/`
    + (addresses && addresses.length > 0
      ? encodeURIComponent(addresses.join(","))
      : "")
    + routeExtra
    + `?${qs}`
  );
}

// =============================================================================
// Names
// =============================================================================
export type SortableNameFields = "name" | "owner" | "original_owner"
  | "registered" | "updated" | "a" | "unpaid";
export type LookupNamesOptions = LookupFilterOptionsBase<SortableNameFields>;

export interface LookupNamesResponse extends LookupResultsBase {
  names: KristName[];
}

export async function lookupNames(addresses: string[] | undefined, opts: LookupNamesOptions): Promise<LookupNamesResponse> {
  const qs = getFilterOptionsQuery(opts);
  return await api.get<LookupNamesResponse>(
    "lookup/names/"
    + (addresses && addresses.length > 0
      ? encodeURIComponent(addresses.join(","))
      : "")
    + "?" + qs
  );
}

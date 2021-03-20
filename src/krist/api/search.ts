// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { KristAddress, KristBlock, KristName, KristTransaction } from "./types";
import * as api from ".";

export interface SearchQueryMatch {
  originalQuery: string;
  matchedAddress: boolean;
  matchedName: boolean;
  matchedBlock: boolean;
  matchedTransaction: boolean;
  strippedName: string;
}

export interface SearchResult {
  query: SearchQueryMatch;

  matches: {
    exactAddress: KristAddress | false;
    exactName: KristName | false;
    exactBlock: KristBlock | false;
    exactTransaction: KristTransaction | false;
  };
}

export interface SearchExtendedResult {
  query: SearchQueryMatch;

  matches: {
    transactions: {
      addressInvolved: number | false;
      nameInvolved: number | false;
      metadata: number | false;
    };
  };
}

export async function search(query?: string): Promise<SearchResult | undefined> {
  if (!query) return;

  return api.get<SearchResult>(
    "search?q=" + encodeURIComponent(query),

    // Don't show the rate limit notification if it is hit, a message will be
    // shown in the search box instead
    { ignoreRateLimit: true }
  );
}

export async function searchExtended(query?: string): Promise<SearchExtendedResult | undefined> {
  if (!query || query.length < 3) return;

  return api.get<SearchExtendedResult>(
    "search/extended?q=" + encodeURIComponent(query),

    // Don't show the rate limit notification if it is hit, a message will be
    // shown in the search box instead
    { ignoreRateLimit: true }
  );
}

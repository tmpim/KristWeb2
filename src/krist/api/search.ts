// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { KristAddress, KristBlock, KristName, KristTransaction } from "./types";
import * as api from "./api";

interface SearchQueryMatch {
  matchedAddress: boolean;
  matchedName: boolean;
  matchedBlock: boolean;
  matchedTransaction: boolean;
  strippedName: string;
}

interface SearchResult {
  query: SearchQueryMatch;

  matches: {
    exactAddress: KristAddress | boolean;
    exactName: KristName | boolean;
    exactBlock: KristBlock | boolean;
    exactTransaction: KristTransaction | boolean;
  };
}

interface SearchExtendedResult {
  query: SearchQueryMatch;

  matches: {
    transactions: {
      addressInvolved: number | boolean;
      nameInvolved: number | boolean;
      metadata: number | boolean;
    };
  };
}

export async function search(syncNode: string, query?: string): Promise<SearchResult | undefined> {
  if (!query) return;
  return api.get<SearchResult>(syncNode, "search?q=" + encodeURIComponent(query));
}

export async function searchExtended(syncNode: string, query?: string): Promise<SearchExtendedResult | undefined> {
  if (!query || query.length < 3) return;
  return api.get<SearchExtendedResult>(syncNode, "search/extended?q=" + encodeURIComponent(query));
}

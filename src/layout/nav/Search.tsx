// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo, useRef, MutableRefObject, Dispatch, SetStateAction, ReactNode } from "react";
import { AutoComplete, Input } from "antd";

import { useTranslation } from "react-i18next";

import { RateLimitError } from "../../krist/api";
import { SearchResult, search, searchExtended, SearchExtendedResult } from "../../krist/api/search";
import { throttle, debounce } from "lodash-es";
import LRU from "lru-cache";

import * as SearchResults from "./SearchResults";

import Debug from "debug";
const debug = Debug("kristweb:search");

const SEARCH_THROTTLE = 500;
const SEARCH_RATE_LIMIT_WAIT = 5000;

async function performAutocomplete(
  query: string,
  waitingForRef: MutableRefObject<string>,
  setResults: (query: string, results: SearchResult | undefined) => void,
  setExtendedResults: (query: string, results: SearchExtendedResult | undefined) => void,
  onRateLimitHit: () => void
) {
  debug("performing search for %s", query);

  // Store the most recent search query so that the results don't arrive out of
  // order.
  waitingForRef.current = query;

  try {
    await Promise.all([
      search(query).then(r => setResults(query, r)),
      searchExtended(query).then(r => setExtendedResults(query, r)),
    ]);
  } catch (err) {
    // Most likely error is `rate_limit_hit`:
    if (err instanceof RateLimitError) onRateLimitHit();
    else console.error(err);
  }
}

export function Search(): JSX.Element {
  const { t } = useTranslation();

  const [value, setValue] = useState("");
  const [results, setResults] = useState<SearchResult | undefined>();
  const [extendedResults, setExtendedResults] = useState<SearchExtendedResult | undefined>();
  const [loading, setLoading] = useState(false);
  const [rateLimitHit, setRateLimitHit] = useState(false);

  // The latest input that we're waiting for a network request for; this avoids
  // out of order search results due to network latency
  const waitingForRef = useRef("");

  const debouncedAutocomplete = useMemo(() => debounce(performAutocomplete, SEARCH_THROTTLE), []);
  const throttledAutocomplete = useMemo(() => throttle(performAutocomplete, SEARCH_THROTTLE), []);

  // LRU cache used to keep track of known search results. This avoids
  // re-fetching search results when the user hits backspaces several times.
  // The cache is cleared each time the search is focused to keep the results
  // fresh.
  const searchCache = useMemo(() => new LRU<string, SearchResult>({ max: 100, maxAge : 300000 }), []);
  const searchExtendedCache = useMemo(() => new LRU<string, SearchExtendedResult>({ max: 100, maxAge : 300000 }), []);

  // Create a function to set the results for a given result type
  const cachedSetResultsBase =
    <T extends SearchResult | SearchExtendedResult>(cache: LRU<string, T>, setResultsFn: Dispatch<SetStateAction<T | undefined>>) =>
      (query: string, results: T | undefined) => {
        // Cowardly refuse to perform any search if the rate limit was hit
        if (!results || rateLimitHit) return setResultsFn(undefined);

        // If this result isn't for the most recent search query (i.e. it
        // arrived out of order), ignore it
        if (query !== waitingForRef.current) {
          debug("ignoring out of order query %s (we need %s)", query, waitingForRef.current);
          return;
        }

        cache.set(query, results);
        setResultsFn(results);
        setLoading(false);
      };

  const cachedSetResults = cachedSetResultsBase(searchCache, setResults);
  const cachedSetExtendedResults = cachedSetResultsBase(searchExtendedCache, setExtendedResults);

  function onRateLimitHit() {
    // Ignore repeated rate limit errors
    if (rateLimitHit) return;

    // Lyqydate the search input and wait 5 seconds before unlocking it
    debug("rate limit hit, locking input for 5 seconds");
    setRateLimitHit(true);

    setTimeout(() => {
      debug("unlocking input");
      setRateLimitHit(false);
    }, SEARCH_RATE_LIMIT_WAIT);
  }

  function onSearch(query: string) {
    debug("query: %s", query);

    // Cowardly refuse to perform any search if the rate limit was hit
    if (rateLimitHit) return;

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setResults(undefined);
      setLoading(false);
      return;
    }

    // Use the search cache if possible, to avoid unnecessary network requests
    const cached = searchCache.get(cleanQuery);
    const cachedExtended = searchExtendedCache.get(cleanQuery);
    if (cached || cachedExtended) {
      debug("using cached result for %s", query);

      // Ensure that an out of order request doesn't overwrite our cached result
      waitingForRef.current = query;

      // Cancel any existing throttled request
      throttledAutocomplete.cancel();
      debouncedAutocomplete.cancel();

      if (cached) setResults(cached);
      if (cachedExtended) setExtendedResults(cachedExtended);

      setLoading(false);
      return;
    }

    setLoading(true);

    // Based on this article:
    // https://www.peterbe.com/plog/how-to-throttle-and-debounce-an-autocomplete-input-in-react
    // Eagerly use `throttle` for short inputs, and patiently use `debounce` for
    // longer inputs.
    const fn = cleanQuery.length < 5 ? throttledAutocomplete : debouncedAutocomplete;
    fn(cleanQuery, waitingForRef, cachedSetResults, cachedSetExtendedResults, onRateLimitHit);
  }

  const staticResult = (value: string, label: ReactNode) => [{ value, label }];

  function renderResults(): { value: string; label: ReactNode }[] {
    const cleanQuery = value.trim();
    debug("current state: %b %b %b %b", rateLimitHit, !cleanQuery, loading, results);

    // Show a warning instead of the results if the rate limit was hit
    if (rateLimitHit) return staticResult("rateLimitHit", <SearchResults.RateLimitHit />);
    // Don't return anything if there's no query at all
    if (!cleanQuery) return [];

    if (!results) {
      // Loading spinner, only if we don't already have some results
      if (loading) return staticResult("loading", <SearchResults.Loading />);
      else return staticResult("noResults", <SearchResults.NoResults />);
    }

    const resultsMatches = results.matches;

    // The list of results to return for the AutoComplete component
    const options = [];

    // The 'exact match' results; these are pretty immediate and return
    // definitive data
    const { exactAddress, exactName, exactBlock, exactTransaction } = resultsMatches;

    if (exactAddress) options.push({
      value: "address-" + exactAddress.address,
      label: <SearchResults.ExactAddressMatch address={exactAddress} />
    });
    if (exactName) options.push({
      value: "name-" + exactName.name,
      label: <SearchResults.ExactNameMatch name={exactName} />
    });
    if (exactBlock) options.push({
      value: "block-" + exactBlock.height,
      label: <SearchResults.ExactBlockMatch block={exactBlock} />
    });
    if (exactTransaction) options.push({
      value: "transaction-" + exactTransaction.id,
      label: <SearchResults.ExactTransactionMatch transaction={exactTransaction} />
    });

    // The 'extended' results; these are counts of transactions and may take a
    // bit longer to load. They're only shown if the query is longer than 3
    // characters.
    if (cleanQuery.length > 3) {
      // Whether or not to show the loading spinner on the extended items.
      // This is a pretty poor way to track if the extended results are still
      // loading some new value.
      const extendedLoading = loading && (!extendedResults || extendedResults.query.originalQuery !== cleanQuery);
      const extendedMatches = extendedResults?.matches?.transactions;

      // Do our own checks to preemptively know what kind of transaction results
      // will be shown. Note that metadata will always be searched.
      const addressInvolved = extendedMatches?.addressInvolved;
      const showAddress = (addressInvolved !== false && addressInvolved !== undefined)
        && exactAddress; // We definitely know the address exists

      const nameInvolved = extendedMatches?.nameInvolved;
      const showName = (nameInvolved !== false && nameInvolved !== undefined)
        && exactName; // We definitely know the name exists

      if (showAddress) options.push({
        value: "transactions-address-" + value,
        label: <SearchResults.ExtendedAddressMatch
          loading={extendedLoading}
          count={typeof addressInvolved === "number" ? addressInvolved : undefined}
          query={value}
        />
      });

      if (showName) options.push({
        value: "transactions-name-" + value,
        label: <SearchResults.ExtendedNameMatch
          loading={extendedLoading}
          count={typeof nameInvolved === "number" ? nameInvolved : undefined}
          query={value}
        />
      });

      // Metadata is always searched
      options.push({
        value: "transactions-metadata-" + value,
        label: <SearchResults.ExtendedMetadataMatch
          loading={extendedLoading}
          count={typeof extendedMatches?.metadata === "number" ? extendedMatches.metadata : undefined}
          query={value}
        />
      });
    }

    return options;
  }

  return <div className="site-header-search-container">
    <AutoComplete
      // Required to make the dropdown show on an Input.Search:
      dropdownMatchSelectWidth={true}
      dropdownClassName="site-header-search-menu"
      className="site-header-search"
      value={value}

      // Always show all options; our search is responsible for providing them
      filterOption={() => true}

      onChange={value => {
        setLoading(true);
        setValue(value);
      }}
      onSearch={onSearch}
      onFocus={() => {
        debug("clearing search cache");
        searchCache.reset();
      }}

      options={renderResults()}
    >
      <Input.Search placeholder={t("nav.search.placeholder")} enterButton />
    </AutoComplete>
  </div>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo, useRef, useEffect, useCallback, MutableRefObject, Dispatch, SetStateAction, ReactNode } from "react";
import { AutoComplete, Input } from "antd";
import { RefSelectProps } from "antd/lib/select";

import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { GlobalHotKeys } from "react-hotkeys";
import { ctrl } from "../../utils";

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
  fetchResults: boolean,
  fetchExtended: boolean,
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
      fetchResults ? search(query).then(r => setResults(query, r)) : undefined,
      fetchExtended ? searchExtended(query).then(r => setExtendedResults(query, r)) : undefined,
    ]);
  } catch (err) {
    // Most likely error is `rate_limit_hit`:
    if (err instanceof RateLimitError) onRateLimitHit();
    else console.error(err);
  }
}

export function Search(): JSX.Element {
  const { t } = useTranslation();
  const history = useHistory();

  const [value, setValue] = useState("");
  const [results, setResults] = useState<SearchResult | undefined>();
  const [extendedResults, setExtendedResults] = useState<SearchExtendedResult | undefined>();
  const [loading, setLoading] = useState(false);
  const [rateLimitHit, setRateLimitHit] = useState(false);
  const [options, setOptions] = useState<{ value: string; label: ReactNode }[]>([]);

  // The latest input that we're waiting for a network request for; this avoids
  // out of order search results due to network latency
  const waitingForRef = useRef("");

  // Used to focus the search when the hotkey is received, or de-focus it when
  // a search result is selected
  const autocompleteRef = useRef<RefSelectProps | null>(null);

  const debouncedAutocomplete = useMemo(() => debounce(performAutocomplete, SEARCH_THROTTLE), []);
  const throttledAutocomplete = useMemo(() => throttle(performAutocomplete, SEARCH_THROTTLE), []);

  // LRU cache used to keep track of known search results. This avoids
  // re-fetching search results when the user hits backspaces several times.
  const searchCache = useMemo(() => new LRU<string, SearchResult>({ max: 100, maxAge : 180000 }), []);
  const searchExtendedCache = useMemo(() => new LRU<string, SearchExtendedResult>({ max: 100, maxAge : 180000 }), []);

  // Create a function to set the results for a given result type
  const cachedSetResultsBase =
    <T extends SearchResult | SearchExtendedResult>(cache: LRU<string, T>, setResultsFn: Dispatch<SetStateAction<T | undefined>>) =>
      (query: string, results: T | undefined) => {
        debug("setting results for %s", query, results);

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
    debug("onSearch: %s", query);

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
      debug("using cached result for %s (results: %b) (extended: %b)", query, !cached, !cachedExtended, cached, cachedExtended);

      // Ensure that an out of order request doesn't overwrite our cached result
      waitingForRef.current = query;

      // Cancel any existing throttled request
      throttledAutocomplete.cancel();
      debouncedAutocomplete.cancel();

      if (cached) setResults(cached);
      if (cachedExtended) setExtendedResults(cachedExtended);

      setLoading(false);
    }

    // If we're missing one or both of the cached result sets, fetch them
    if (!cached || !cachedExtended) {
      debug("nothing cached for %s, (results: %b) (extended: %b), considering a fetch", query, !cached, !cachedExtended);

      setLoading(true);

      // Based on this article:
      // https://www.peterbe.com/plog/how-to-throttle-and-debounce-an-autocomplete-input-in-react
      // Eagerly use `throttle` for short inputs, and patiently use `debounce`
      // for longer inputs.
      const fn = cleanQuery.length < 5
        ? throttledAutocomplete
        : debouncedAutocomplete;

      fn(
        cleanQuery,
        !cached, !cachedExtended,
        waitingForRef,
        cachedSetResults, cachedSetExtendedResults,
        onRateLimitHit
      );
    }
  }

  /** Navigate to the selected search result. */
  function onSelect(query: string) {
    debug("onSelect %s", query);

    // Reset the search value when a result is selected. This is because,
    // otherwise, the internal value (e.g. `exactAddress`) would remain in
    // there, which would look pretty odd.
    // REVIEW: Would be nice to avoid having to do it this way entirely.
    setValue("");

    // If we're still loading the results, don't search just yet.
    // TODO: is it possible to defer this instead?
    if (loading || !results) return;

    const resultsMatches = results.matches;
    const { exactAddress, exactName, exactBlock, exactTransaction } = resultsMatches;

    debug("search selected value %s", query);

    // Whether or not we actually matched a value. This should pretty much
    // always be true.
    let matched = true;

    // Using the internal result type, navigate to the relevant page.
    // FIXME: this is kinda wack
    if (query === "exactAddress" && exactAddress) {
      history.push(`/network/addresses/${encodeURIComponent(exactAddress.address)}`);
    } else if (query === "exactName" && exactName) {
      history.push(`/network/names/${encodeURIComponent(exactName.name)}`);
    } else if (query === "exactBlock" && exactBlock) {
      history.push(`/network/blocks/${encodeURIComponent(exactBlock.height)}`);
    } else if (query === "exactTransaction" && exactTransaction) {
      history.push(`/network/transactions/${encodeURIComponent(exactTransaction.id)}`);
    } else if (extendedResults) {
      if (query === "extendedTransactionsAddress") {
        // TODO
      } else if (query === "extendedTransactionsName") {
        // TODO
      } else if (query === "extendedTransactionsMetadata") {
        // TODO
      } else {
        matched = false;
        debug("warn: unknown search type %s", query);
      }
    } else {
      matched = false;
      debug("warn: unknown search type %s", query);
    }

    // De-focus the search textbox when an item is selected.
    if (matched && autocompleteRef.current)
      autocompleteRef.current.blur();
  }

  // When the 'enter' key is pressed while an autocomplete option isn't focused,
  // or the user clicks the 'search' button, the autocomplete has no way of
  // knowing which option to search with. So, we look at the first option in the
  // list and send that to onSelect.
  function onInputSearch() {
    // If we're still loading the results, don't search just yet.
    // TODO: is it possible to defer this instead?
    if (loading || !results) return;

    if (!options || !options.length) return;
    onSelect(options[0].value);
  }

  const staticOption = (value: string, label: ReactNode) => [{ value, label }];
  const renderOptions = useCallback(function(): { value: string; label: ReactNode }[] {
    const cleanQuery = value.trim();
    // debug("current state: %b %b %b %b", rateLimitHit, !cleanQuery, loading, results);

    // Show a warning instead of the results if the rate limit was hit
    if (rateLimitHit) return staticOption("rateLimitHit", <SearchResults.RateLimitHit />);
    // Don't return anything if there's no query at all
    if (!cleanQuery) return [];

    if (!results) {
      // Loading spinner, only if we don't already have some results
      if (loading) return staticOption("loading", <SearchResults.Loading />);
      else return staticOption("noResults", <SearchResults.NoResults />);
    }

    const resultsMatches = results.matches;

    // The list of results to return for the AutoComplete component
    const options = [];

    // The 'exact match' results; these are pretty immediate and return
    // definitive data
    const { exactAddress, exactName, exactBlock, exactTransaction } = resultsMatches;

    if (exactAddress) options.push({
      value: "exactAddress",
      label: <SearchResults.ExactAddressMatch address={exactAddress} />
    });
    if (exactName) options.push({
      value: "exactName",
      label: <SearchResults.ExactNameMatch name={exactName} />
    });
    if (exactBlock) options.push({
      value: "exactBlock",
      label: <SearchResults.ExactBlockMatch block={exactBlock} />
    });
    if (exactTransaction) options.push({
      value: "exactTransaction",
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
        value: "extendedTransactionsAddress",
        label: <SearchResults.ExtendedAddressMatch
          loading={extendedLoading}
          count={typeof addressInvolved === "number" ? addressInvolved : undefined}
          query={value}
        />
      });

      if (showName) options.push({
        value: "extendedTransactionsName",
        label: <SearchResults.ExtendedNameMatch
          loading={extendedLoading}
          count={typeof nameInvolved === "number" ? nameInvolved : undefined}
          query={value}
        />
      });

      // Metadata is always searched
      options.push({
        value: "extendedTransactionsMetadata",
        label: <SearchResults.ExtendedMetadataMatch
          loading={extendedLoading}
          count={typeof extendedMatches?.metadata === "number" ? extendedMatches.metadata : undefined}
          query={value}
        />
      });
    }

    return options;
  }, [value, loading, rateLimitHit, results, extendedResults]);

  useEffect(() => {
    setOptions(renderOptions());
  }, [renderOptions]);

  return <div className="site-header-search-container">
    <GlobalHotKeys
      // REVIEW: I know that Mousetrap supports "mod+k" to maintain correct
      //         behaviour with Command/Ctrl between Windows/Linux and macOS,
      //         however I was unable to get it working on Windows in my limited
      //         testing. Thus, it needs to be reviewed if this works on macOS
      //         at all.
      keyMap={{ SEARCH: ["command+k", "ctrl+k"] }}
      handlers={{
        SEARCH: e => {
          console.log(e);
          e?.preventDefault();
          autocompleteRef.current?.focus();
        }
      }}
    />

    <AutoComplete
      // Used to focus the search when the hotkey is received, or de-focus it
      // when a search result is selected
      ref={autocompleteRef}

      // Required to make the dropdown show on an Input.Search:
      dropdownMatchSelectWidth={true}
      dropdownClassName="site-header-search-menu"
      className="site-header-search"
      value={value}

      // Always show all options; our search is responsible for providing them
      filterOption={() => true}

      onChange={value => {
        // debug("search onChange %s", value);
        setLoading(true);
        setValue(value);
      }}
      onSearch={onSearch}
      onSelect={onSelect}

      // NOTE: This was removed and the LRU expiry time was lowered; a definite
      //       decision on whether or not the cache should be cleared every time
      //       the search is opened hasn't been reached, but at the moment it
      //       seems to be better to just keep the cached entries around, as
      //       speed and lack of network spam is better than accuracy of the
      //       result hints. Besides, pressing enter will always take you to the
      //       up-to-date data anyway.
      /* onFocus={() => {
        debug("clearing search cache");
        searchCache.reset();
      }} */

      options={options}
    >
      <Input.Search
        placeholder={t("nav.search.placeholderShortcut", { shortcut: `${ctrl}+K` })}
        onSearch={onInputSearch}
      />
    </AutoComplete>
  </div>;
}

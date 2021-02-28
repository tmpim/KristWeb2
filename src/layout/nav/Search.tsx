// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo, useRef, MutableRefObject, Dispatch, SetStateAction, ReactNode } from "react";
import { AutoComplete, Input, Typography, Spin } from "antd";

import { useTranslation } from "react-i18next";

import { RateLimitError } from "../../krist/api";
import { SearchResult, search, searchExtended } from "../../krist/api/search";
import { throttle, debounce } from "lodash-es";
import LRU from "lru-cache";

import Debug from "debug";
const debug = Debug("kristweb:search");

const { Text } = Typography;

const SEARCH_THROTTLE = 500;
const SEARCH_RATE_LIMIT_WAIT = 5000;

async function performAutocomplete(
  query: string,
  waitingForRef: MutableRefObject<string>,
  setResults: (query: string, results: SearchResult | undefined) => void,
  setRateLimitHit: Dispatch<SetStateAction<boolean>>
) {
  debug("performing search for %s", query);

  // Store the most recent search query so that the results don't arrive
  // out of order.
  waitingForRef.current = query;

  try {
    const results = await search(query);
    setResults(query, results);
  } catch (err) {
    // Most likely error is `rate_limit_hit`:
    if (err instanceof RateLimitError) {
      // Lyqydate the search input and wait 5 seconds before unlocking it
      debug("rate limit hit, locking input for 5 seconds");
      setRateLimitHit(true);

      setTimeout(() => {
        debug("unlocking input");
        setRateLimitHit(false);
      }, SEARCH_RATE_LIMIT_WAIT);
    } else {
      console.error(err);
    }
  }
}

export function Search(): JSX.Element {
  const { t } = useTranslation();

  const [value, setValue] = useState("");
  const [results, setResults] = useState<SearchResult | undefined>();
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

  function cachedSetResults(query: string, results: SearchResult | undefined) {
    // Cowardly refuse to perform any search if the rate limit was hit
    if (!results || rateLimitHit) return setResults(undefined);

    // If this result isn't for the most recent search query (i.e. it arrived
    // out of order), ignore it
    if (query !== waitingForRef.current) {
      debug("ignoring out of order query %s (we need %s)", query, waitingForRef.current);
      return;
    }

    searchCache.set(query, results);
    setResults(results);
    setLoading(false);
  }

  function onSearch(query: string) {
    // Cowardly refuse to perform any search if the rate limit was hit
    if (rateLimitHit) return;

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setLoading(false);
      return setResults(undefined);
    }

    // Use the search cache if possible, to avoid unnecessary network requests
    const cached = searchCache.get(cleanQuery);
    if (cached) {
      debug("using cached result for %s", query);

      // Ensure that an out of order request doesn't overwrite our cached result
      waitingForRef.current = query;

      // Cancel any existing throttled request
      throttledAutocomplete.cancel();
      debouncedAutocomplete.cancel();

      setResults(cached);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Based on this article:
    // https://www.peterbe.com/plog/how-to-throttle-and-debounce-an-autocomplete-input-in-react
    // Eagerly use `throttle` for short inputs, and patiently use `debounce` for
    // longer inputs.
    const fn = cleanQuery.length < 5 ? throttledAutocomplete : debouncedAutocomplete;
    fn(cleanQuery, waitingForRef, cachedSetResults, setRateLimitHit);
  }

  function renderResults(): { value: string; label: ReactNode }[] {
    // Show a warning instead of the results if the rate limit was hit
    if (rateLimitHit) {
      return [{
        value: "rate_limit_hit",
        label: <Text type="secondary">{t("nav.search.rateLimitHit")}</Text>
      }];
    }

    // Don't return anything if there's no query at all
    const cleanQuery = value.trim();
    if (!cleanQuery) return [];

    // Loading spinner, only if we don't already have some results
    if (loading && !results) {
      return [{ value: "loading", label: (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
          <Spin />
        </div>
      )}];
    }

    // No results placeholder
    if (!loading && !results) {
      return [{
        value: "no_results",
        label: <Text type="secondary">{t("nav.search.noResults")}</Text>
      }];
    }

    return [];
  }

  return <div className="site-header-search-container">
    <AutoComplete
      // Required to make the dropdown show on an Input.Search:
      dropdownMatchSelectWidth={true}
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

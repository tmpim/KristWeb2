// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useMemo } from "react";
import { Switch } from "antd";

import { useTranslation, TFunction } from "react-i18next";
import { useParams, useLocation } from "react-router-dom";
import { Location } from "history";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@store";
import { State as NodeState } from "@reducers/NodeReducer";

import { PageLayout } from "@layout/PageLayout";
import { APIErrorResult } from "@comp/results/APIErrorResult";
import { NoWalletsResult } from "@comp/results/NoWalletsResult";
import { TransactionsTable } from "./TransactionsTable";

import { useWallets } from "@wallets";
import { useSubscription } from "@global/ws/WebsocketSubscription";
import { useBooleanSetting } from "@utils/settings";
import { useLinkedPagination } from "@utils/table/table";
import { useHistoryState } from "@utils/hooks";
import { KristNameLink } from "@comp/names/KristNameLink";

import "./TransactionsPage.less";

/** The type of transaction listing to search by. */
export enum ListingType {
  /** Transactions involving the user's wallets */
  WALLETS,

  /** Transactions across the whole network */
  NETWORK_ALL,
  /** Network transactions filtered to a particular address */
  NETWORK_ADDRESS,

  /** Name history transactions */
  NAME_HISTORY,
  /** Transactions sent to a particular name */
  NAME_SENT,

  /** Transaction search for address */
  SEARCH_ADDRESS,
  /** Transaction search for name */
  SEARCH_NAME,
  /** Transaction search for metadata */
  SEARCH_METADATA
}

const LISTING_TYPE_TITLES: Record<ListingType, string> = {
  [ListingType.WALLETS]: "transactions.myTransactionsTitle",

  [ListingType.NETWORK_ALL]: "transactions.title",
  [ListingType.NETWORK_ADDRESS]: "transactions.title",

  [ListingType.NAME_HISTORY]: "transactions.nameHistoryTitle",
  [ListingType.NAME_SENT]: "transactions.nameTransactionsTitle",

  [ListingType.SEARCH_ADDRESS]: "transactions.searchTitle",
  [ListingType.SEARCH_NAME]: "transactions.searchTitle",
  [ListingType.SEARCH_METADATA]: "transactions.searchTitle"
};

interface ParamTypes {
  address?: string;
  name?: string;
  query?: string;
}

interface Props {
  listingType: ListingType;
}

/** Returns the correct site title key (with parameters if necessary) for the
 * given listing type. */
function getSiteTitle(t: TFunction, listingType: ListingType, address?: string): string {
  switch (listingType) {
  case ListingType.WALLETS:
    return t("transactions.siteTitleWallets");
  case ListingType.NETWORK_ALL:
    return t("transactions.siteTitleNetworkAll");
  case ListingType.NETWORK_ADDRESS:
    return t("transactions.siteTitleNetworkAddress", { address });
  case ListingType.NAME_HISTORY:
    return t("transactions.siteTitleNameHistory");
  case ListingType.NAME_SENT:
    return t("transactions.siteTitleNameSent");
  case ListingType.SEARCH_ADDRESS:
  case ListingType.SEARCH_NAME:
  case ListingType.SEARCH_METADATA:
    return t("transactions.siteTitleSearch");
  }
}

/** Returns the correct PageHeader sub title for the given listing type. */
function getSubTitle(t: TFunction, listingType: ListingType, params: ParamTypes): React.ReactNode {
  switch (listingType) {
  // Lookup for an individual address's transactions show that address
  case ListingType.NETWORK_ADDRESS:
    return params.address;

  // Name lookups show the name
  case ListingType.NAME_HISTORY:
  case ListingType.NAME_SENT:
    return <KristNameLink noLink name={params.name || ""} neverCopyable />;

  // The searches show a special sub title for each type of query
  case ListingType.SEARCH_ADDRESS:
    return t("transactions.subTitleSearchAddress", { address: params.address });
  case ListingType.SEARCH_NAME:
    return t("transactions.subTitleSearchName", { name: params.name });
  case ListingType.SEARCH_METADATA:
    return t("transactions.subTitleSearchMetadata", { query: params.query });

  // Everything else does not show a sub title
  default: return undefined;
  }
}

/** Returns the correct auto-refresh ID for the given listing type. */
function getRefreshID(
  listingType: ListingType,
  includeMined: boolean,
  node: NodeState,
  subscribedRefreshID: number
): number {
  switch (listingType) {
  case ListingType.WALLETS:
    return node.lastOwnTransactionID;
  case ListingType.NAME_HISTORY:
  case ListingType.NAME_SENT:
  case ListingType.NETWORK_ADDRESS:
    // Use the websocket subscription
    return subscribedRefreshID;
  case ListingType.NETWORK_ALL:
    // Prevent annoying refreshes when blocks are mined
    return includeMined
      ? node.lastTransactionID
      : node.lastNonMinedTransactionID;
  // No auto-refresh for searches
  case ListingType.SEARCH_ADDRESS:
  case ListingType.SEARCH_NAME:
  case ListingType.SEARCH_METADATA:
    return 0;
  }
}

/**
 * Returns the lookup parameters based on the URL. Uses 'address' and 'name'
 * from the params unless this is a search, in which case they are derived from
 * the search query parameter `?q`.
 */
function getParams(
  listingType: ListingType,
  urlParams: ParamTypes,
  location: Location
): ParamTypes {
  // Parse the query parameters
  const qs = new URLSearchParams(location.search);

  switch (listingType) {
  // For the search lookups, get the params from the URL
  case ListingType.SEARCH_ADDRESS:
    return { address: qs.get("q") || "" };
  case ListingType.SEARCH_NAME:
    return { name: qs.get("q") || "" };
  case ListingType.SEARCH_METADATA:
    return { query: qs.get("q") || "" };
  // For everything else, return what we already have
  default:
    return urlParams;
  }
}

export function TransactionsPage({ listingType }: Props): JSX.Element {
  const { t } = useTranslation();

  // Derive the lookup parameters from the URL
  const urlParams = useParams<ParamTypes>();
  const location = useLocation();
  const { address, name, query } = getParams(listingType, urlParams, location);

  // Whether or not to show mined transactions
  const alwaysIncludeMined = useBooleanSetting("alwaysIncludeMined");
  const [includeMined, setIncludeMined] = useHistoryState(alwaysIncludeMined, "includeMined");

  // If there is an error (e.g. the lookup rejected the address list due to an
  // invalid address), the table will bubble it up to here
  const [error, setError] = useState<Error | undefined>();

  // Linked pagination from the table
  const [paginationComponent, setPagination] = useLinkedPagination();

  // Used to handle memoisation and auto-refreshing
  const { joinedAddressList } = useWallets();
  const nodeState = useSelector((s: RootState) => s.node, shallowEqual);
  const subscribedRefreshID = useSubscription({ address, name });
  const shouldAutoRefresh = useBooleanSetting("autoRefreshTables");

  // Comma-separated list of addresses, used as an optimisation for
  // memoisation (no deep equality in useMemo)
  const usedAddresses = listingType === ListingType.WALLETS
    ? joinedAddressList : address;

  // If auto-refresh is disabled, use a static refresh ID
  const usedRefreshID = shouldAutoRefresh
    ? getRefreshID(listingType, includeMined, nodeState, subscribedRefreshID)
    : 0;

  // Memoise the table so that it only updates the props (thus triggering a
  // re-fetch of the transactions) when something relevant changes
  const memoTable = useMemo(() => (
    <TransactionsTable
      listingType={listingType}
      refreshingID={usedRefreshID}

      addresses={usedAddresses?.split(",")}
      name={name}
      query={query}

      includeMined={includeMined}

      setError={setError}
      setPagination={setPagination}
    />
  ), [
    listingType,
    usedAddresses, name, query,
    usedRefreshID,
    includeMined,
    setError, setPagination
  ]);

  // Alter the page titles depending on the listing type
  const titleKey = LISTING_TYPE_TITLES[listingType];
  const siteTitle = getSiteTitle(t, listingType, address);
  const subTitle = getSubTitle(t, listingType, { address, name, query });

  const isEmpty = listingType === ListingType.WALLETS && !joinedAddressList;

  return <PageLayout
    className="transactions-page"

    // Alter the page titles depending on the listing type
    titleKey={titleKey}
    siteTitle={siteTitle}
    subTitle={subTitle}

    extra={paginationComponent}
  >
    {(() => {
      if (error)
        return <APIErrorResult
          error={error}

          invalidParameterTitleKey="transactions.resultInvalidTitle"
          invalidParameterSubTitleKey="transactions.resultInvalid"
        />;
      else if (isEmpty) return <NoWalletsResult type="transactions" />;
      else return <>
        {memoTable}

        {/* "Include mined transactions" switch in the bottom right */}
        {listingType !== ListingType.SEARCH_METADATA && !name && (
          <div className="transactions-mined-switch">
            <Switch
              checked={includeMined}
              onChange={setIncludeMined}
            />
            <span>{t("transactions.includeMined")}</span>
          </div>
        )}
      </>;
    })()}
  </PageLayout>;
}

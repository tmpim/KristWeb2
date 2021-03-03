// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo } from "react";

import { useTranslation, TFunction } from "react-i18next";
import { useParams } from "react-router-dom";

import { useSelector } from "react-redux";
import { RootState } from "../../store";

import { PageLayout } from "../../layout/PageLayout";
import { NamesResult } from "./NamesResult";
import { NamesTable } from "./NamesTable";

import { useWallets } from "../../krist/wallets/Wallet";
import { useBooleanSetting } from "../../utils/settings";

import "./NamesPage.less";

/** The type of name listing to search by. */
export enum ListingType {
  /** Names owned by the user's wallets */
  WALLETS,

  /** Names across the whole network */
  NETWORK_ALL,
  /** Network names filtered to a particular owner */
  NETWORK_ADDRESS
}

const LISTING_TYPE_TITLES: Record<ListingType, string> = {
  [ListingType.WALLETS]: "names.titleWallets",
  [ListingType.NETWORK_ALL]: "names.titleNetworkAll",
  [ListingType.NETWORK_ADDRESS]: "names.titleNetworkAddress"
};

interface ParamTypes {
  address?: string;
}

interface Props {
  listingType: ListingType;
  sortNew?: boolean;
}

function getSiteTitle(t: TFunction, listingType: ListingType, address?: string): string {
  switch (listingType) {
  case ListingType.WALLETS:
    return t("names.siteTitleWallets");
  case ListingType.NETWORK_ALL:
    return t("names.siteTitleNetworkAll");
  case ListingType.NETWORK_ADDRESS:
    return t("names.siteTitleNetworkAddress", { address });
  }
}

export function NamesPage({ listingType, sortNew }: Props): JSX.Element {
  const { t } = useTranslation();
  const { address } = useParams<ParamTypes>();

  // If there is an error (e.g. the lookup rejected the address list due to an
  // invalid address), the table will bubble it up to here
  const [error, setError] = useState<Error | undefined>();

  // Used to handle memoisation and auto-refreshing
  const { joinedAddressList } = useWallets();
  const lastNameTransactionID = useSelector((s: RootState) => s.node.lastNameTransactionID);
  const lastOwnNameTransactionID = useSelector((s: RootState) => s.node.lastOwnNameTransactionID);
  const shouldAutoRefresh = useBooleanSetting("autoRefreshTables");

  // Comma-separated list of addresses, used as an optimisation for
  // memoisation (no deep equality in useMemo)
  const usedAddresses = listingType === ListingType.WALLETS
    ? joinedAddressList : address;

  // If auto-refresh is disabled, use a static refresh ID
  const usedRefreshID = shouldAutoRefresh
    ? (listingType === ListingType.WALLETS
      ? lastOwnNameTransactionID
      : lastNameTransactionID)
    : 0;

  // Memoise the table so that it only updates the props (thus triggering a
  // re-fetch of the names) when something relevant changes
  const memoTable = useMemo(() => (
    <NamesTable
      refreshingID={usedRefreshID}
      sortNew={sortNew}
      addresses={usedAddresses?.split(",")}
      setError={setError}
    />
  ), [usedAddresses, sortNew, usedRefreshID, setError]);

  const siteTitle = getSiteTitle(t, listingType, address);
  const subTitle = listingType === ListingType.NETWORK_ADDRESS
    ? address : undefined;

  return <PageLayout
    className="names-page"
    withoutTopPadding
    negativeMargin

    // Alter the page title depending on the listing type
    titleKey={LISTING_TYPE_TITLES[listingType]}
    siteTitle={siteTitle}
    // For an address's name listing, show that address in the subtitle.
    subTitle={subTitle}
  >
    {error
      ? <NamesResult error={error} />
      : memoTable}
  </PageLayout>;
}

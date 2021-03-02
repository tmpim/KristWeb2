// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo, Dispatch, SetStateAction } from "react";

import { useTranslation, TFunction } from "react-i18next";
import { useParams } from "react-router-dom";

import { PageLayout } from "../../layout/PageLayout";
import { NamesResult } from "./NamesResult";
import { NamesTable } from "./NamesTable";

import { useWallets } from "../../krist/wallets/Wallet";

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

export function NamesPage({ listingType }: Props): JSX.Element {
  const { t } = useTranslation();
  const { address } = useParams<ParamTypes>();

  // If there is an error (e.g. the lookup rejected the address list due to an
  // invalid address), the table will bubble it up to here
  const [error, setError] = useState<Error | undefined>();

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
      : (listingType === ListingType.WALLETS
        // Version of the table component that memoises the wallets
        ? <NamesTableWithWallets setError={setError} />
        : <NamesTable addresses={address ? [address] : undefined} setError={setError} />)}
  </PageLayout>;
}

/**
 * This is equivalent to TransactionsPage.TransactionsTableWithWallets. See that
 * component for some comments and review on why this is necessary, and how it
 * could be improved in the future.
 */
function NamesTableWithWallets({ setError }: { setError: Dispatch<SetStateAction<Error | undefined>> }): JSX.Element {
  const { walletAddressMap } = useWallets();

  // See TransactionsPage.tsx for comments
  // TODO: improve this
  const addresses = Object.keys(walletAddressMap);
  addresses.sort();
  const addressList = addresses.join(",");

  const table = useMemo(() => (
    <NamesTable
      addresses={addressList.split(",")}
      setError={setError}
    />
  ), [addressList, setError]);

  return table;
}

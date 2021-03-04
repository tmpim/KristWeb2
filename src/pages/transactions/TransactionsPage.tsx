// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo } from "react";
import { Switch } from "antd";

import { useTranslation, TFunction } from "react-i18next";
import { useParams } from "react-router-dom";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";
import { State as NodeState } from "../../store/reducers/NodeReducer";

import { PageLayout } from "../../layout/PageLayout";
import { APIErrorResult } from "../../components/results/APIErrorResult";
import { TransactionsTable } from "./TransactionsTable";

import { useWallets } from "../../krist/wallets/Wallet";
import { useBooleanSetting } from "../../utils/settings";
import { useLinkedPagination } from "../../utils/table";
import { KristNameLink } from "../../components/names/KristNameLink";

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
}

const LISTING_TYPE_TITLES: Record<ListingType, string> = {
  [ListingType.WALLETS]: "transactions.myTransactionsTitle",

  [ListingType.NETWORK_ALL]: "transactions.title",
  [ListingType.NETWORK_ADDRESS]: "transactions.title",

  [ListingType.NAME_HISTORY]: "transactions.nameHistoryTitle",
  [ListingType.NAME_SENT]: "transactions.nameTransactionsTitle"
};

interface ParamTypes {
  address?: string;
  name?: string;
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
  }
}

/** Returns the correct auto-refresh ID for the given listing type. */
function getRefreshID(listingType: ListingType, includeMined: boolean, node: NodeState): number {
  switch (listingType) {
  case ListingType.WALLETS:
    return node.lastOwnTransactionID;
  case ListingType.NAME_HISTORY:
    return node.lastNameTransactionID;
  case ListingType.NAME_SENT:
  case ListingType.NETWORK_ALL:
  case ListingType.NETWORK_ADDRESS: // TODO: subscribe to a single name
    // Prevent annoying refreshes when blocks are mined
    return includeMined
      ? node.lastTransactionID
      : node.lastNonMinedTransactionID;
  }
}

export function TransactionsPage({ listingType }: Props): JSX.Element {
  const { t } = useTranslation();
  const { address, name } = useParams<ParamTypes>();
  const alwaysIncludeMined = useBooleanSetting("alwaysIncludeMined");

  const [includeMined, setIncludeMined] = useState(alwaysIncludeMined);
  // If there is an error (e.g. the lookup rejected the address list due to an
  // invalid address), the table will bubble it up to here
  const [error, setError] = useState<Error | undefined>();

  // Linked pagination from the table
  const [paginationComponent, setPagination] = useLinkedPagination();

  // Used to handle memoisation and auto-refreshing
  const { joinedAddressList } = useWallets();
  const nodeState = useSelector((s: RootState) => s.node, shallowEqual);
  const shouldAutoRefresh = useBooleanSetting("autoRefreshTables");

  // Comma-separated list of addresses, used as an optimisation for
  // memoisation (no deep equality in useMemo)
  const usedAddresses = listingType === ListingType.WALLETS
    ? joinedAddressList : address;

  // If auto-refresh is disabled, use a static refresh ID
  const usedRefreshID = shouldAutoRefresh
    ? getRefreshID(listingType, includeMined, nodeState) : 0;

  // Memoise the table so that it only updates the props (thus triggering a
  // re-fetch of the transactions) when something relevant changes
  const memoTable = useMemo(() => (
    <TransactionsTable
      listingType={listingType}
      refreshingID={usedRefreshID}

      addresses={usedAddresses?.split(",")}
      name={name}

      includeMined={includeMined}

      setError={setError}
      setPagination={setPagination}
    />
  ), [listingType, usedAddresses, name, usedRefreshID, includeMined, setError, setPagination]);

  const siteTitle = getSiteTitle(t, listingType, address);
  const subTitle = name
    ? <KristNameLink noLink name={name} neverCopyable />
    : (listingType === ListingType.NETWORK_ADDRESS
      ? address
      : undefined);

  return <PageLayout
    className="transactions-page"

    // Alter the page title depending on the listing type
    titleKey={LISTING_TYPE_TITLES[listingType]}
    siteTitle={siteTitle}

    // For an address's transaction listing, show that address in the subtitle.
    // For a name listing, show the name in the subtitle.
    subTitle={subTitle}

    extra={paginationComponent}
  >
    {error
      ? (
        <APIErrorResult
          error={error}

          invalidParameterTitleKey="transactions.resultInvalidTitle"
          invalidParameterSubTitleKey="transactions.resultInvalid"
        />
      )
      : <>
        {memoTable}

        {/* "Include mined transactions" switch in the bottom right */}
        {!name && <div className="transactions-mined-switch">
          <Switch
            checked={includeMined}
            onChange={setIncludeMined}
          />
          <span>{t("transactions.includeMined")}</span>
        </div>}
      </>}
  </PageLayout>;
}

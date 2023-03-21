// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useMemo, useEffect } from "react";
import { Button } from "antd";
import { TagsOutlined } from "@ant-design/icons";

import { useTranslation, TFunction } from "react-i18next";
import { useParams } from "react-router-dom";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { PageLayout } from "@layout/PageLayout";
import { APIErrorResult } from "@comp/results/APIErrorResult";
import { NoWalletsResult } from "@comp/results/NoWalletsResult";
import { NamesTable } from "./NamesTable";

import { NamePurchaseModalLink } from "./mgmt/NamePurchaseModalLink";

import { useNameEditModal } from "./mgmt/NameEditModalLink";
import { useSendTransactionModal } from "@comp/transactions/SendTransactionModalLink";

import { useWallets } from "@wallets";
import { useBooleanSetting } from "@utils/settings";
import { useTopMenuOptions } from "@layout/nav/TopMenu";

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
  [ListingType.NETWORK_ALL]: "names.titleNetworkGlobal",
  [ListingType.NETWORK_ADDRESS]: "names.titleNetworkGlobal"
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
    return t("names.siteTitleNetworkGlobal");
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

  const [openNameEdit, nameEditModal] = useNameEditModal();
  const [openSendTx, sendTxModal] = useSendTransactionModal();

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

  const [,, unset, setOpenSortModal] = useTopMenuOptions();
  useEffect(() => unset, [unset]);

  // Memoise the table so that it only updates the props (thus triggering a
  // re-fetch of the names) when something relevant changes
  const memoTable = useMemo(() => (
    <NamesTable
      refreshingID={usedRefreshID}
      sortNew={sortNew}
      addresses={usedAddresses?.split(",")}
      setError={setError}

      openNameEdit={openNameEdit}
      openSendTx={openSendTx}
      setOpenSortModal={setOpenSortModal}
    />
  ), [
    usedAddresses, sortNew, usedRefreshID, setError, openSendTx, openNameEdit,
    setOpenSortModal
  ]);

  const siteTitle = getSiteTitle(t, listingType, address);
  const subTitle = listingType === ListingType.NETWORK_ADDRESS
    ? address : undefined;

  const isEmpty = listingType === ListingType.WALLETS && !joinedAddressList;

  return <PageLayout
    className="names-page"

    // Alter the page title depending on the listing type
    titleKey={LISTING_TYPE_TITLES[listingType]}
    siteTitle={siteTitle}
    // For an address's name listing, show that address in the subtitle.
    subTitle={subTitle}

    // Purchase name button
    extra={<>
      {!error && !isEmpty && (
        <NamePurchaseModalLink>
          <Button type="primary" icon={<TagsOutlined />}>
            {t("names.purchaseButton")}
          </Button>
        </NamePurchaseModalLink>
      )}
    </>}
  >
    {(() => {
      if (error)
        return <APIErrorResult
          error={error}

          invalidParameterTitleKey="names.resultInvalidTitle"
          invalidParameterSubTitleKey="names.resultInvalid"
        />;
      else if (isEmpty) return <NoWalletsResult type="names" />;
      else return <>
        {memoTable}

        {nameEditModal}
        {sendTxModal}
      </>;
    })()}
  </PageLayout>;
}

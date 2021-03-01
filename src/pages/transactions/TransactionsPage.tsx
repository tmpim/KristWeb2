// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo, Dispatch, SetStateAction } from "react";
import { Switch } from "antd";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { PageLayout } from "../../layout/PageLayout";
import { TransactionsResult } from "./TransactionsResult";
import { TransactionsTable } from "./TransactionsTable";

import { useWallets } from "../../krist/wallets/Wallet";

/** The type of transaction listing to search by. */
export enum ListingType {
  /** Transactions involving the user's wallets */
  WALLETS,

  /** Transactions across the whole network */
  NETWORK_ALL,
  /** Network transactions filtered to a particular address */
  NETWORK_ADDRESS
}

interface ParamTypes {
  address?: string;
}

interface Props {
  listingType: ListingType;
}

export function TransactionsPage({ listingType }: Props): JSX.Element {
  const { t } = useTranslation();
  const { address } = useParams<ParamTypes>();

  // If there is an error (e.g. the lookup rejected the address list due to an
  // invalid address), the table will bubble it up to here
  const [error, setError] = useState<Error | undefined>();

  const [includeMined, setIncludeMined] = useState(false);

  return <PageLayout
    className="transactions-page"
    withoutTopPadding

    // Alter the page title depending on the listing type
    titleKey={listingType === ListingType.WALLETS
      ? "transactions.myTransactionsTitle"
      : "transactions.title"}

    // For an address's transaction listing, show that address in the subtitle
    subTitle={listingType === ListingType.NETWORK_ADDRESS
      ? address
      : undefined}

    // "Include mined transactions" switch in the top right
    extra={<>
      <Switch
        checked={includeMined}
        onChange={setIncludeMined}
      />
      <span>{t("transactions.includeMined")}</span>
    </>}
  >
    {error
      ? <TransactionsResult error={error} />
      : (listingType === ListingType.WALLETS
        ? (
          // Version of the table component that memoises the wallets
          <TransactionsTableWithWallets
            includeMined={includeMined}
            setError={setError}
          />
        )
        : (
          <TransactionsTable
            addresses={address ? [address] : undefined}
            includeMined={includeMined}
            setError={setError}
          />
        ))}
  </PageLayout>;
}

interface TableWithWalletsProps {
  includeMined: boolean;
  setError: Dispatch<SetStateAction<Error | undefined>>;
}

/**
 * We only want to fetch the wallets (because changes will cause re-renders)
 * if this is a wallet transactions listing. In order to achieve a conditional
 * hook, the table is wrapped in this component only if the listing type is
 * WALLETS.
 */
function TransactionsTableWithWallets({ includeMined, setError }: TableWithWalletsProps): JSX.Element {
  const { walletAddressMap } = useWallets();
  const addresses = Object.keys(walletAddressMap);

  // The instance created by Object.keys is going to be different every time,
  // but its values probably won't change. So, we're going to need a rather
  // crude deep equality check.
  // TODO: Perhaps do this check on the whole wallets object, so that we can
  //       auto-refresh the table when balances change, but still avoid
  //       refreshing otherwise.
  // REVIEW: Another idea is to store a 'lastTransactionID' in Redux,
  //         concerning only our own wallets (and, in the future, a subscribed
  //         wallet when viewing an external address?). This way, we can still
  //         auto-refresh whenever we have to (a wallet is added/removed, a
  //         transaction is made to one of our wallets), and never when we
  //         don't.
  addresses.sort();
  const addressList = addresses.join(",");

  const table = useMemo(() => (
    <TransactionsTable
      addresses={addressList.split(",")}
      includeMined={includeMined}
      setError={setError}
    />
  ), [addressList, includeMined, setError]);

  return table;
}

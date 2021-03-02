// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import classNames from "classnames";
import { Tooltip, Typography } from "antd";

import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { KristAddress } from "../krist/api/types";
import { Wallet, useWallets } from "../krist/wallets/Wallet";
import { parseCommonMeta, CommonMeta } from "../utils/commonmeta";
import { stripNameSuffix } from "../utils/currency";
import { useBooleanSetting } from "../utils/settings";

import { KristNameLink } from "./KristNameLink";

import "./ContextualAddress.less";

const { Text } = Typography;

interface Props {
  address: KristAddress | string | null;
  wallet?: Wallet | false;
  metadata?: string;
  source?: boolean;
  hideNameAddress?: boolean;
  allowWrap?: boolean;
  neverCopyable?: boolean;
  className?: string;
}

interface AddressMetanameProps {
  nameSuffix: string;
  address: string;
  commonMeta: CommonMeta;
  source: boolean;
  hideNameAddress: boolean;
}

export function AddressMetaname({ nameSuffix, address, commonMeta, source, hideNameAddress }: AddressMetanameProps): JSX.Element {
  const rawMetaname = (source ? commonMeta?.return : commonMeta?.recipient) || undefined;
  const metaname = (source ? commonMeta?.returnMetaname : commonMeta?.metaname) || undefined;
  const name = (source ? commonMeta?.returnName : commonMeta?.name) || undefined;
  const nameWithoutSuffix = name ? stripNameSuffix(nameSuffix, name) : undefined;

  return name
    ? <>
      {/* Display the name/metaname (e.g. foo@bar.kst) */}
      {metaname && <><span className="address-metaname">{metaname}@</span></>}
      <KristNameLink name={nameWithoutSuffix!} className="address-name" />

      {/* Display the original address too */}
      {!hideNameAddress && <>
        &nbsp;<span className="address-original">
          <Link to={"/network/addresses/" + encodeURIComponent(address)}>
            ({address})
          </Link>
        </span>
      </>}
    </>
    : (
      // Display the raw metaname, but link to the owner address
      <Link to={"/network/addresses/" + encodeURIComponent(address)}>
        <span className="address-raw-metaname">{rawMetaname}</span>
      </Link>
    );
}

export function ContextualAddress({
  address: origAddress,
  wallet: origWallet,
  metadata,
  source,
  hideNameAddress,
  allowWrap,
  neverCopyable,
  className
}: Props): JSX.Element {
  const { t } = useTranslation();
  const { walletAddressMap } = useWallets();
  const nameSuffix = useSelector((s: RootState) => s.node.currency.name_suffix);
  const addressCopyButtons = useBooleanSetting("addressCopyButtons");

  if (!origAddress) return (
    <span className="contextual-address address-unknown">{t("contextualAddressUnknown")}</span>
  );

  const address = typeof origAddress === "object" ? origAddress.address : origAddress;

  // If we were given a wallet, use it. Otherwise, look it up, unless it was
  // explicitly excluded (e.g. the Wallets table)
  const wallet = origWallet !== false
    ? (origWallet || walletAddressMap[address])
    : undefined;

  const commonMeta = parseCommonMeta(nameSuffix, metadata);
  const hasMetaname = source ? !!commonMeta?.returnRecipient : !!commonMeta?.recipient;

  const copyable = !neverCopyable && addressCopyButtons
    ? { text: address } : undefined;

  const classes = classNames("contextual-address", className, {
    "contextual-address-allow-wrap": allowWrap
  });

  return <Text className={classes} copyable={copyable}>
    <Tooltip title={address}>
      {commonMeta && hasMetaname
        ? (
          // Display the metaname and link to the name if possible
          <AddressMetaname
            nameSuffix={nameSuffix}
            address={address}
            commonMeta={commonMeta}
            source={!!source}
            hideNameAddress={!!hideNameAddress}
          />
        )
        : (
          // Display our wallet label if present, but link to the address
          <Link to={"/network/addresses/" + encodeURIComponent(address)}>
            {wallet && wallet.label
              ? <span className="address-wallet">{wallet.label}</span>
              : <span className="address-address">{address}</span>}
          </Link>
        )
      }
    </Tooltip>
  </Text>;
}

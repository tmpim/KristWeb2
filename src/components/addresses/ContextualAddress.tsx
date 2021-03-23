// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";
import { Tooltip } from "antd";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { KristAddress } from "@api/types";
import { Wallet, useWallets } from "@wallets";
import { Contact, useContacts } from "@contacts";
import { parseCommonMeta, CommonMeta } from "@utils/commonmeta";
import { useNameSuffix, stripNameSuffix } from "@utils/currency";
import { useBooleanSetting } from "@utils/settings";

import { KristNameLink } from "../names/KristNameLink";
import { ConditionalLink } from "@comp/ConditionalLink";
import { SmallCopyable } from "@comp/SmallCopyable";

import { getVerified, VerifiedAddressLink } from "./VerifiedAddress";

import "./ContextualAddress.less";

interface Props {
  address: KristAddress | string | null;
  wallet?: Wallet | false;
  contact?: Contact | false;
  metadata?: string;
  source?: boolean;
  hideNameAddress?: boolean;
  allowWrap?: boolean;
  neverCopyable?: boolean;
  nonExistent?: boolean;
  className?: string;
}

export function ContextualAddress({
  address: origAddress,
  wallet: origWallet,
  contact: origContact,
  metadata,
  source,
  hideNameAddress,
  allowWrap,
  neverCopyable,
  nonExistent,
  className
}: Props): JSX.Element {
  const { t } = useTranslation();
  const { walletAddressMap } = useWallets();
  const { contactAddressMap } = useContacts();
  const nameSuffix = useNameSuffix();
  const addressCopyButtons = useBooleanSetting("addressCopyButtons");

  if (!origAddress) return (
    <span className="contextual-address address-unknown">
      {t("contextualAddressUnknown")}
    </span>
  );

  const address = typeof origAddress === "object"
    ? origAddress.address
    : origAddress;

  // If we were given a wallet, use it. Otherwise, look it up, unless it was
  // explicitly excluded (e.g. the Wallets table)
  const wallet = origWallet !== false
    ? (origWallet || walletAddressMap[address])
    : undefined;
  const contact = origContact !== false
    ? (origContact || contactAddressMap[address])
    : undefined;

  const commonMeta = parseCommonMeta(nameSuffix, metadata);
  const hasMetaname = source
    ? !!commonMeta?.returnRecipient
    : !!commonMeta?.recipient;

  const verified = getVerified(address);

  // If the address definitely doesn't exist, show the 'not yet initialised'
  // tooltip on hover instead.
  const showTooltip = !verified &&
    ((hideNameAddress && !!hasMetaname) || !!wallet?.label || !!contact?.label);
  const tooltipTitle = nonExistent
    ? t("contextualAddressNonExistentTooltip")
    : (showTooltip ? address : undefined);

  const copyable = !neverCopyable && addressCopyButtons
    ? { text: address } : undefined;

  const classes = classNames("contextual-address", className, {
    "contextual-address-allow-wrap": allowWrap,
    "contextual-address-non-existent": nonExistent
  });

  // The main contents of the contextual address, may be wrapped in a tooltip
  const mainContents = commonMeta && hasMetaname
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
    : (verified
      // Display the verified address if possible
      ? <VerifiedAddressLink address={address} verified={verified} />
      : (
        // Display the regular address or label
        <ConditionalLink
          to={"/network/addresses/" + encodeURIComponent(address)}
          matchTo
          matchExact
          condition={!nonExistent}
        >
          <AddressContent
            wallet={wallet}
            contact={contact}
            address={address}
          />
        </ConditionalLink>
      )
    );

  return <span className={classes}>
    {/* Only render the tooltip component if it's actually used */}
    {tooltipTitle
      ? (
        <Tooltip title={tooltipTitle}>
          {mainContents}

          {/* This empty child here forces the Tooltip to change its hover
            * behaviour. Pretty funky, needs investigating. */}
          <></>
        </Tooltip>
      )
      : mainContents}

    {copyable && <SmallCopyable {...copyable} />}
  </span>;
}

interface AddressContentProps {
  wallet?: Wallet;
  contact?: Contact;
  address: string;
}

/** The label of the wallet or contact, or the address itself (not a metaname) */
function AddressContent({
  wallet,
  contact,
  address,
  ...props
}: AddressContentProps): JSX.Element {
  return wallet?.label
    ? <span className="address-wallet" {...props}>{wallet.label}</span>
    : (contact?.label
      ? <span className="address-contact" {...props}>{contact.label}</span>
      : <span className="address-address" {...props}>{address}</span>);
}

interface AddressMetanameProps {
  nameSuffix: string;
  address: string;
  commonMeta: CommonMeta;
  source: boolean;
  hideNameAddress: boolean;
}

export function AddressMetaname({
  nameSuffix,
  address,
  commonMeta,
  source,
  hideNameAddress
}: AddressMetanameProps): JSX.Element {
  const rawMetaname = (source ? commonMeta?.return : commonMeta?.recipient) || undefined;
  const name = (source ? commonMeta?.returnName : commonMeta?.name) || undefined;
  const nameWithoutSuffix = name ? stripNameSuffix(nameSuffix, name) : undefined;

  const verified = getVerified(address);

  function AddressContent() {
    return verified
      ? (
        // Verified address
        <VerifiedAddressLink address={address} verified={verified} parens />
      )
      : (
        // Regular address
        <span className="address-original">
          <ConditionalLink
            to={"/network/addresses/" + encodeURIComponent(address)}
            matchTo
            matchExact
          >
            ({address})
          </ConditionalLink>
        </span>
      );
  }

  return name
    ? <>
      {/* Display the name/metaname (e.g. foo@bar.kst) */}
      <KristNameLink
        className="address-name"
        name={nameWithoutSuffix!}
        text={rawMetaname}
      />

      {/* Display the original address too */}
      {!hideNameAddress && <>
        &nbsp;<AddressContent />
      </>}
    </>
    : (
      // Display the raw metaname, but link to the owner address
      <Link to={"/network/addresses/" + encodeURIComponent(address)}>
        <span className="address-raw-metaname">{rawMetaname}</span>
      </Link>
    );
}

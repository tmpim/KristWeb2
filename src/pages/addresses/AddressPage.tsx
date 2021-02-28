// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect } from "react";
import { Row, Col, Skeleton, Button } from "antd";
import { SendOutlined, UserAddOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { PageLayout } from "../../layout/PageLayout";
import { AddressResult } from "./AddressResult";

import { Statistic } from "../../components/Statistic";
import { KristValue } from "../../components/KristValue";
import { DateTime } from "../../components/DateTime";

import * as api from "../../krist/api";
import { lookupAddress, KristAddressWithNames } from "../../krist/api/lookup";

import "./AddressPage.less";

interface ParamTypes {
  address: string;
}

function Page({ address }: { address: KristAddressWithNames }): JSX.Element {
  const { t } = useTranslation();

  return <>
    {/* Address and buttons */}
    <Row className="top-address-row">
      {/* Address */}
      <h1 className="address">{address.address}</h1>

      {/* Send Krist button */}
      {/* TODO: If this is one of our own wallets then say 'Transfer krist' */}
      <Button type="primary" icon={<SendOutlined />}>
        {t("address.buttonSendKrist", { address: address.address })}
      </Button>

      {/* Add friend button */}
      {/* TODO: Change this to edit if they're already a friend, and if it is
                one of our own wallets then say 'Edit wallet' */}
      <Button icon={<UserAddOutlined />}>
        {t("address.buttonAddFriend")}
      </Button>
    </Row>

    {/* Main address info */}
    <Row className="address-info-row">
      {/* Current balance */}
      <Col span={24} md={8}>
        <Statistic
          titleKey="address.balance"
          value={<KristValue long green highlightZero value={address.balance} />}
        />
      </Col>

      {/* Names */}
      <Col span={24} md={8}>
        <Statistic
          titleKey="address.names"
          value={t("address.nameCount", { count: address.names })}
        />
      </Col>

      {/* First seen */}
      <Col span={24} md={8}>
        <Statistic
          titleKey="address.firstSeen"
          value={<DateTime date={address.firstseen} />}
        />
      </Col>
    </Row>
  </>;
}

export function AddressPage(): JSX.Element {
  // Used to refresh the address data on syncNode change
  const syncNode = api.useSyncNode();

  const { address } = useParams<ParamTypes>();
  const [kristAddress, setKristAddress] = useState<KristAddressWithNames | undefined>();
  const [error, setError] = useState<Error | undefined>();

  // Load the address on page load
  // TODO: passthrough router state to pre-load from search
  // REVIEW: The search no longer clears the LRU cache on each open, meaning it
  //         is possible for an address's information to be up to 3 minutes
  //         out-of-date in the search box. If we passed through the state from
  //         the search and directly used it here, it would definitely be too
  //         outdated to display. It could be possible to show that state data
  //         and still lookup the most recent data, but is it worth it? The page
  //         would appear 10-200ms faster, sure, but if the data _has_ changed,
  //         then it would cause a jarring re-render, just to save a single
  //         cheap network request. Will definitely require some further
  //         usability testing.
  useEffect(() => {
    lookupAddress(address, true)
      .then(setKristAddress)
      .catch(setError);
  }, [syncNode, address]);

  // Change the page title depending on whether or not the address has loaded
  const title = kristAddress
    ? { siteTitle: kristAddress.address, subTitle: kristAddress.address }
    : { siteTitleKey: "address.title" };

  return <PageLayout
    className="address-page"
    titleKey="address.title"
    {...title}
  >
    {error
      ? <AddressResult error={error} />
      : (kristAddress
        ? <Page address={kristAddress} />
        : <Skeleton active />)}
  </PageLayout>;
}

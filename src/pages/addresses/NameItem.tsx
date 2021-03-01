// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Row, Col, Tooltip, Grid } from "antd";

import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

import TimeAgo from "react-timeago";

import { KristName } from "../../krist/api/types";
import { KristNameLink } from "../../components/KristNameLink";

export function NameItem({ name }: { name: KristName }): JSX.Element {
  const { t } = useTranslation();

  const nameEl = <KristNameLink name={name.name} />;
  const nameLink = "/network/names/" + encodeURIComponent(name.name);
  const nameTime = new Date(name.registered);

  return <Row className="card-list-item address-name-item">
    <div className="name-info">
      {/* Display 'purchased' if this is the original owner, otherwise display
        * 'received'. */}
      {name.owner === name.original_owner
        ? <Trans t={t} i18nKey="address.namePurchased">Purchased {nameEl}</Trans>
        : <Trans t={t} i18nKey="address.nameReceived">Received {nameEl}</Trans>}
    </div>

    {/* Purchase time */}
    <Tooltip title={nameTime.toISOString()}>
      <Link to={nameLink} className="name-registered"><TimeAgo date={nameTime} /></Link>
    </Tooltip>
  </Row>;
}

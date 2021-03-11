// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect } from "react";
import classNames from "classnames";
import { Card, Skeleton, Empty, Row } from "antd";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { NameItem } from "./NameItem";
import { lookupNames, LookupNamesResponse } from "@api/lookup";

import { useSyncNode } from "@api";

import { SmallResult } from "@comp/results/SmallResult";

import Debug from "debug";
const debug = Debug("kristweb:address-names-card");

async function fetchNames(address: string): Promise<LookupNamesResponse> {
  debug("fetching names");
  return lookupNames(
    [address],
    { limit: 5, orderBy: "registered", order: "DESC" }
  );
}

export function AddressNamesCard({ address }: { address: string }): JSX.Element {
  const { t } = useTranslation();
  const syncNode = useSyncNode();

  const [res, setRes] = useState<LookupNamesResponse | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);

  // Fetch names on page load or sync node reload
  useEffect(() => {
    if (!syncNode) return;

    // Remove the existing results in case the address changed
    setRes(undefined);
    setLoading(true);

    fetchNames(address)
      .then(setRes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [syncNode, address]);

  const isEmpty = !loading && (error || !res || res.count === 0);
  const classes = classNames("kw-card", "address-card-names", {
    "empty": isEmpty
  });

  return <Card title={t("address.cardNamesTitle")} className={classes}>
    <Skeleton paragraph={{ rows: 4 }} title={false} active loading={loading}>
      {error
        ? <SmallResult status="error" title={t("error")} subTitle={t("address.namesError")} />
        : (res && res.count > 0
          ? <>
            {/* Name listing */}
            {res.names.map(name => <NameItem key={name.name} name={name} />)}

            {/* See more link */}
            <Row className="card-more address-names-more">
              <Link to={`/network/addresses/${encodeURIComponent(address)}/names`}>
                {t("address.namesSeeMore", { count: res.total })}
              </Link>
            </Row>
          </>
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
    </Skeleton>
  </Card>;
}

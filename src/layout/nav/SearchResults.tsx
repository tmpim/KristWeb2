// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { ReactNode } from "react";
import { Typography, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { Trans, useTranslation } from "react-i18next";

import { KristAddress, KristName, KristBlock, KristTransaction } from "../../krist/api/types";
import { KristValue } from "../../components/KristValue";
import { KristNameLink } from "../../components/KristNameLink";
import { DateTime } from "../../components/DateTime";

import "./SearchResults.less";

const { Text } = Typography;

export function Loading(): JSX.Element {
  return <div className="search-result-loading"><Spin /></div>;
}

export function NoResults(): JSX.Element {
  const { t } = useTranslation();
  return <Text type="secondary">{t("nav.search.noResults")}</Text>;
}

export function RateLimitHit(): JSX.Element {
  const { t } = useTranslation();
  return <Text type="danger">{t("nav.search.rateLimitHit")}</Text>;
}

interface ExactMatchBaseProps {
  typeKey: string;
  primaryValue: ReactNode | number;
  extraInfo?: ReactNode;
}
export function ExactMatchBase({ typeKey, primaryValue, extraInfo }: ExactMatchBaseProps): JSX.Element {
  const { t } = useTranslation();

  return <div className="search-result search-result-exact">
    <div className="result-left">
      {/* Result type (e.g. 'Address', 'Transaction') */}
      <span className="search-result-type">
        {t(typeKey)}
      </span>

      {/* Primary result value (e.g. the address, the ID) */}
      <span className="search-result-value">
        {typeof primaryValue === "number"
          ? primaryValue.toLocaleString()
          : primaryValue}
      </span>
    </div>

    {extraInfo && <div className="result-right">
      {extraInfo}
    </div>}
  </div>;
}

export function ExactAddressMatch({ address }: { address: KristAddress }): JSX.Element {
  return <ExactMatchBase
    typeKey="nav.search.resultAddress"
    primaryValue={address.address}
    extraInfo={<KristValue value={address.balance} />}
  />;
}

export function ExactNameMatch({ name }: { name: KristName }): JSX.Element {
  const { t } = useTranslation();

  function Owner() {
    return <b>{name.owner}</b>;
  }

  return <ExactMatchBase
    typeKey="nav.search.resultName"
    primaryValue={<KristNameLink name={name.name} noLink />}
    extraInfo={<span className="search-name-owner">
      <Trans t={t} i18nKey="nav.search.resultNameOwner">
        Owned by <Owner />
      </Trans>
    </span>}
  />;
}

export function ExactBlockMatch({ block }: { block: KristBlock }): JSX.Element {
  const { t } = useTranslation();

  function Miner() {
    return <b>{block.address}</b>;
  }

  return <ExactMatchBase
    typeKey="nav.search.resultBlockID"
    primaryValue={block.height}
    extraInfo={<>
      <span className="search-block-miner">
        <Trans t={t} i18nKey="nav.search.resultBlockIDMinedBy">
          Mined by <Miner />
        </Trans>
      </span>

      <DateTime date={block.time} />
    </>}
  />;
}

export function ExactTransactionMatch({ transaction }: { transaction: KristTransaction }): JSX.Element {
  return <ExactMatchBase
    typeKey="nav.search.resultTransactionID"
    primaryValue={transaction.id}
    extraInfo={<>
      <KristValue value={transaction.value} />
      <DateTime date={transaction.time} />
    </>}
  />;
}

interface ExtendedMatchProps {
  loading?: boolean;
  count?: number;
  query?: ReactNode;

  loadingKey: string;
  resultKey: string;
}
type ExtendedMatchBaseProps = Omit<ExtendedMatchProps, "loadingKey" | "resultKey" | "query"> & { query: string };
export function ExtendedMatchBase({ loading, count, query, loadingKey, resultKey }: ExtendedMatchProps): JSX.Element {
  const { t } = useTranslation();

  function Query(): JSX.Element {
    return <>{query}</>;
  }

  return <div className="search-result search-result-extended">
    {/* Result type (e.g. 'Address', 'Transaction') */}
    <span className="search-result-type">
      {t("nav.search.resultTransactions")}
    </span>

    <span className="search-result-extended-info">
      {loading || typeof count !== "number"
        ? <>
          <LoadingOutlined spin />
          <Trans t={t} i18nKey={loadingKey}>
            Placeholder <Query />
          </Trans>
        </>
        : <Trans t={t} i18nKey={resultKey} count={count}>
          <b>{{ count }}</b> placeholder <Query />
        </Trans>}

    </span>
  </div>;
}

export function ExtendedAddressMatch(props: ExtendedMatchBaseProps): JSX.Element {
  return <ExtendedMatchBase
    {...props}

    query={<b>{props.query}</b>}

    loadingKey="nav.search.resultTransactionsAddress"
    resultKey="nav.search.resultTransactionsAddressResult"
  />;
}

export function ExtendedNameMatch(props: ExtendedMatchBaseProps): JSX.Element {
  return <ExtendedMatchBase
    {...props}

    query={<KristNameLink name={props.query} noLink />}

    loadingKey="nav.search.resultTransactionsName"
    resultKey="nav.search.resultTransactionsNameResult"
  />;
}

export function ExtendedMetadataMatch(props: ExtendedMatchBaseProps): JSX.Element {
  return <ExtendedMatchBase
    {...props}

    query={<>&apos;<b>{props.query}</b>&apos;</>}

    loadingKey="nav.search.resultTransactionsMetadata"
    resultKey="nav.search.resultTransactionsMetadataResult"
  />;
}

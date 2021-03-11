// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";
import { Button } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { SmallResult } from "./SmallResult";

export type ResultType = "transactions" | "names";

interface Props {
  type?: ResultType;
  className?: string;
}

function OtherButton({ type }: { type?: ResultType }): JSX.Element | null {
  const { t } = useTranslation();

  if (type === "transactions") {
    return (
      // Network transactions
      <Link to="/network/transactions">
        <Button>{t("noWalletsResult.buttonNetworkTransactions")}</Button>
      </Link>
    );
  } else if (type === "names") {
    return (
      // Network names
      <Link to="/network/names">
        <Button>{t("noWalletsResult.buttonNetworkNames")}</Button>
      </Link>
    );
  } else {
    return null;
  }
}

export function NoWalletsResult({ type, className }: Props): JSX.Element {
  const { t } = useTranslation();

  const classes = classNames("kw-no-wallets-result", className);

  return <SmallResult
    className={classes}

    status="info"
    icon={<InfoCircleOutlined />}

    title={t("noWalletsResult.title")}
    subTitle={t("noWalletsResult.subTitle")}
    extra={<>
      {/* Other helpful buttons (e.g. 'Network transactions') */}
      {<OtherButton type={type} />}

      {/* 'Add wallets' button that links to the 'My wallets' page */}
      <Link to="/wallets">
        <Button type="primary">{t("noWalletsResult.button")}</Button>
      </Link>
    </>}

    fullPage
  />;
}

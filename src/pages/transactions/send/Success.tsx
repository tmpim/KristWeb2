// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Button } from "antd";

import { useTranslation, Trans } from "react-i18next";

import { Link } from "react-router-dom";

import { KristTransaction } from "@api/types";
import { KristValue } from "@comp/krist/KristValue";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";

export function NotifSuccessContents({ tx }: { tx: KristTransaction }): JSX.Element {
  const { t } = useTranslation();

  return <Trans t={t} i18nKey="sendTransaction.successNotificationContent">
    You sent
    <KristValue value={tx.value} />
    from
    <ContextualAddress
      address={tx.from}
      metadata={tx.metadata}
      source
      neverCopyable
    />
    to
    <ContextualAddress
      address={tx.to}
      metadata={tx.metadata}
      neverCopyable
    />
  </Trans>;
}

export function NotifSuccessButton({ tx }: { tx: KristTransaction }): JSX.Element {
  const { t } = useTranslation();

  return <Link to={"/network/transactions/" + encodeURIComponent(tx.id)}>
    <Button type="primary">
      {t("sendTransaction.successNotificationButton")}
    </Button>
  </Link>;
}

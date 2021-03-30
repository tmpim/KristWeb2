// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { MoreOutlined } from "@ant-design/icons";

import { Trans } from "react-i18next";
import { useTFns } from "@utils/i18n";

import { SmallResult } from "@comp/results/SmallResult";

export function NoWalletsMobileResult(): JSX.Element {
  const { tStr, tKey } = useTFns("myWallets.");

  return <SmallResult
    className="no-wallets-mobile-result"
    title={tStr("noWalletsHint")}
    subTitle={<Trans i18nKey={tKey("noWalletsText")}>
      Add or create a wallet by clicking the <MoreOutlined /> menu in the
      top right!
    </Trans>}
  />;
}

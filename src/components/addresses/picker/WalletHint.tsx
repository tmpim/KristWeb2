// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useTranslation, Trans } from "react-i18next";

import { Wallet } from "@wallets";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";

interface Props {
  wallet: Wallet;
}

export function WalletHint({ wallet }: Props): JSX.Element {
  const { t } = useTranslation();

  return <span className="address-picker-hint address-picker-wallet-hint">
    <Trans t={t} i18nKey="addressPicker.walletHint">
      Owner: <ContextualAddress address={wallet.address} />
    </Trans>
  </span>;
}

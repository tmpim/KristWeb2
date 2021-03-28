// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useTranslation } from "react-i18next";

import { PageLayout } from "@layout/PageLayout";

import { useWallets } from "@wallets";

import { useWalletsPageActions } from "./WalletsPageActions";
import { WalletsTable } from "./WalletsTable";

import { useEditWalletModal } from "./WalletEditButton";
import { useSendTransactionModal } from "@comp/transactions/SendTransactionModalLink";
import { useWalletInfoModal } from "./info/WalletInfoModal";

import "./WalletsPage.less";

/** Extract the subtitle into its own component to avoid re-rendering the
 * entire page when a wallet is added. */
function WalletsPageSubtitle(): JSX.Element {
  const { t } = useTranslation();
  const { addressList } = useWallets();

  const count = addressList.length;

  return <>{count > 0
    ? t("myWallets.walletCount", { count })
    : t("myWallets.walletCountEmpty")
  }</>;
}

export function WalletsPage(): JSX.Element {
  const [openEditWallet, editWalletModal] = useEditWalletModal();
  const [openSendTx, sendTxModal] = useSendTransactionModal();
  const [openWalletInfo, walletInfoModal] = useWalletInfoModal();

  const extra = useWalletsPageActions();

  return <PageLayout
    siteTitleKey="myWallets.title" titleKey="myWallets.title"
    subTitle={<WalletsPageSubtitle />}
    extra={extra}
    className="wallets-page"
  >
    <WalletsTable
      openEditWallet={openEditWallet}
      openSendTx={openSendTx}
      openWalletInfo={openWalletInfo}
    />

    {/* Rendered only once, as an optimisation */}
    {editWalletModal}
    {sendTxModal}
    {walletInfoModal}
  </PageLayout>;
}

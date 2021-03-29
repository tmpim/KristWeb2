// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo } from "react";
import { Tag, Collapse } from "antd";

import { Trans } from "react-i18next";
import { useTFns } from "@utils/i18n";

import { Wallet } from "@wallets";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { KristValue } from "@comp/krist/KristValue";
import { DateTime } from "@comp/DateTime";

import { OpenEditWalletFn } from "./WalletEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";
import { OpenWalletInfoFn } from "./info/WalletInfoModal";

import { WalletMobileItemActions } from "./WalletMobileItemActions";

interface Props {
  wallet: Wallet;

  openEditWallet: OpenEditWalletFn;
  openSendTx: OpenSendTxFn;
  openWalletInfo: OpenWalletInfoFn;
}

export function WalletMobileItem({
  wallet,
  openEditWallet,
  openSendTx,
  openWalletInfo
}: Props): JSX.Element {
  const { t, tStr, tKey } = useTFns("myWallets.");

  const itemHead = useMemo(() => (
    <div className="wallet-mobile-item-header">
      {/* Wallet balance */}
      <div className="wallet-value">
        <KristValue value={wallet.balance} hideNullish />
      </div>

      {/* Label, if possible */}
      {wallet.label && <span className="wallet-label">
        {wallet.label}
        {/* Don't save tag */}
        {wallet.dontSave && (
          <Tag style={{ marginLeft: 8, textTransform: "uppercase" }}>
            {tStr("tagDontSave")}
          </Tag>
        )}
      </span>}

      <div className="wallet-info-row">
        {/* Address */}
        <ContextualAddress
          address={wallet.address}
          wallet={false}
          contact={false}
          nonExistent={!wallet.firstSeen}
          noLink
          noTooltip
        />

        {/* Category */}
        {wallet.category && <>
          <span className="sep" />

          <span className="wallet-category">
            {wallet.category}
          </span>
        </>}

        {/* Names */}
        {(wallet.names || 0) > 0 && <>
          <span className="sep" />

          <span className="wallet-names">
            {t(tKey("nameCount"), { count: wallet.names })}
          </span>
        </>}
      </div>

      {/* First seen */}
      {wallet.firstSeen && <div className="wallet-first-seen">
        <Trans i18nKey={tKey("firstSeenMobile")}>
          First seen <DateTime date={wallet.firstSeen} />
        </Trans>
      </div>}
    </div>
  ), [
    t, tKey, tStr,
    wallet.address, wallet.label, wallet.category, wallet.dontSave,
    wallet.firstSeen, wallet.balance, wallet.names
  ]);

  return <Collapse ghost className="card-list-item mobile-item-collapse wallet-mobile-item">
    <Collapse.Panel key={wallet.id} showArrow={false} header={itemHead}>
      <WalletMobileItemActions
        wallet={wallet}
        openEditWallet={openEditWallet}
        openSendTx={openSendTx}
        openWalletInfo={openWalletInfo}
      />
    </Collapse.Panel>
  </Collapse>;
}

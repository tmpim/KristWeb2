// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useCallback, useMemo } from "react";
import { Tag, Collapse, Menu } from "antd";
import {
  ProfileOutlined, SendOutlined, EditOutlined, InfoCircleOutlined,
  DeleteOutlined
} from "@ant-design/icons";

import { Trans } from "react-i18next";
import { useTFns } from "@utils/i18n";

import { useHistory } from "react-router-dom";

import { Wallet } from "@wallets";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { KristValue } from "@comp/krist/KristValue";
import { DateTime } from "@comp/DateTime";

import { useAuth } from "@comp/auth";
import { OpenEditWalletFn } from "./WalletEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";
import { OpenWalletInfoFn } from "./info/WalletInfoModal";
import { showWalletDeleteConfirmModal } from "./WalletActions";

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

  return <Collapse ghost className="card-list-item wallet-mobile-item">
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

function WalletMobileItemActions({
  wallet,
  openEditWallet,
  openSendTx,
  openWalletInfo
}: Props): JSX.Element {
  const { t, tStr } = useTFns("myWallets.");

  const history = useHistory();
  const promptAuth = useAuth();

  const showWalletDeleteConfirm = useCallback(
    () => showWalletDeleteConfirmModal(t, tStr, wallet),
    [t, tStr, wallet]
  );

  const addressLink = `/network/addresses/${encodeURIComponent(wallet.address)}`;

  return <Menu selectable={false}>
    {/* View address */}
    <Menu.Item key="1" icon={<ProfileOutlined />}
      onClick={() => history.push(addressLink)}>
      {tStr("actionsViewAddress")}
    </Menu.Item>

    {/* Send Krist */}
    <Menu.Item key="2" icon={<SendOutlined />}
      onClick={() => promptAuth(false, () => openSendTx(wallet))}>
      {tStr("actionsSendTransaction")}
    </Menu.Item>

    <Menu.Divider />

    {/* Edit wallet */}
    <Menu.Item key="3" icon={<EditOutlined />}
      onClick={() => promptAuth(false, () => openEditWallet(wallet))}>
      {tStr("actionsEditTooltip")}
    </Menu.Item>

    {/* Wallet info */}
    <Menu.Item key="4" icon={<InfoCircleOutlined />}
      onClick={() => openWalletInfo(wallet)}>
      {tStr("actionsWalletInfo")}
    </Menu.Item>

    <Menu.Divider />

    {/* Delete wallet */}
    <Menu.Item key="5" danger icon={<DeleteOutlined />}
      onClick={showWalletDeleteConfirm}>
      {tStr("actionsDelete")}
    </Menu.Item>
  </Menu>;
}

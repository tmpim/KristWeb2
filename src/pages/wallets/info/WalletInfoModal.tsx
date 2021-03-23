// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { Modal, Button, DescriptionsProps } from "antd";

import { useTranslation } from "react-i18next";

import { Wallet } from "@wallets";
import { WalletDescBasicInfo } from "./WalletDescBasicInfo";
import { WalletDescSyncedInfo } from "./WalletDescSyncedInfo";
import { WalletDescAdvancedInfo } from "./WalletDescAdvancedInfo";

import "./WalletInfoModal.less";

export interface WalletDescProps {
  wallet: Wallet;
  descProps: DescriptionsProps;
}

interface Props {
  wallet: Wallet;

  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function WalletInfoModal({
  wallet,
  visible, setVisible
}: Props): JSX.Element {
  const { t } = useTranslation();

  const closeModal = () => setVisible(false);

  const descProps: DescriptionsProps = {
    column: 1,
    size: "small",
    bordered: true
  };

  return <Modal
    visible={visible}
    title={t("myWallets.info.title", { address: wallet.address })}

    className="wallet-info-modal"
    width={640}

    footer={[
      // Just a close button
      <Button key="close" onClick={closeModal}>
        {t("dialog.close")}
      </Button>
    ]}

    onCancel={closeModal}
    destroyOnClose
  >
    <WalletDescBasicInfo wallet={wallet} descProps={descProps} />
    <WalletDescSyncedInfo wallet={wallet} descProps={descProps} />
    <WalletDescAdvancedInfo wallet={wallet} descProps={descProps} />
  </Modal>;
}

export type OpenWalletInfoFn = (wallet: Wallet) => void;
export type WalletInfoHookRes = [
  OpenWalletInfoFn,
  JSX.Element | null,
  (visible: boolean) => void
];

export function useWalletInfoModal(): WalletInfoHookRes {
  const [opened, setOpened] = useState(false);
  const [visible, setVisible] = useState(false);
  const [wallet, setWallet] = useState<Wallet>();

  const open = useCallback((wallet: Wallet) => {
    setWallet(wallet);
    setVisible(true);
    setOpened(true);
  }, []);

  const modal = opened && wallet
    ? <WalletInfoModal wallet={wallet} visible={visible} setVisible={setVisible} />
    : null;

  return [open, modal, setVisible];
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Dispatch, SetStateAction } from "react";
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

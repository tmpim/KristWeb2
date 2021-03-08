// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Descriptions } from "antd";

import { useTranslation } from "react-i18next";

import { OptionalField } from "@comp/OptionalField";
import { DecryptReveal } from "./DecryptReveal";

import { WalletDescProps } from "./WalletInfoModal";

export function WalletDescBasicInfo({ wallet, descProps }: WalletDescProps): JSX.Element {
  const { t } = useTranslation();

  return <Descriptions title={t("myWallets.info.titleBasicInfo")} {...descProps}>
    {/* Wallet UUID */}
    <Descriptions.Item label={t("myWallets.info.id")}>
      <OptionalField copyable value={wallet.id} />
    </Descriptions.Item>

    {/* Wallet Label */}
    <Descriptions.Item label={t("myWallets.info.label")}>
      <OptionalField copyable value={wallet.label} />
    </Descriptions.Item>
    {/* Wallet Category */}
    <Descriptions.Item label={t("myWallets.info.category")}>
      <OptionalField copyable value={wallet.category} />
    </Descriptions.Item>

    {/* Wallet Username */}
    <Descriptions.Item label={t("myWallets.info.username")}>
      <OptionalField copyable value={wallet.username} />
    </Descriptions.Item>
    {/* Wallet Password */}
    <Descriptions.Item label={t("myWallets.info.password")}>
        <DecryptReveal copyable encrypted value={wallet.encPassword} />
    </Descriptions.Item>
    {/* Wallet Private Key */}
    <Descriptions.Item label={t("myWallets.info.privatekey")}>
        <DecryptReveal copyable encrypted value={wallet.encPrivatekey} />
    </Descriptions.Item>
    {/* Wallet Format */}
    <Descriptions.Item label={t("myWallets.info.format")}>
      <OptionalField copyable value={wallet.format} />
    </Descriptions.Item>
  </Descriptions>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Descriptions } from "antd";

import { useTranslation } from "react-i18next";

import { OptionalField } from "@comp/OptionalField";
import { DecryptReveal } from "./DecryptReveal";
import { BooleanText } from "./BooleanText";

import { WalletDescProps } from "./WalletInfoModal";

export function WalletDescAdvancedInfo({ wallet, descProps }: WalletDescProps): JSX.Element {
  const { t } = useTranslation();

  return <Descriptions title={t("myWallets.info.titleAdvancedInfo")} {...descProps}>
    {/* Wallet Encrypted Password */}
    <Descriptions.Item label={t("myWallets.info.encPassword")}>
      <OptionalField value={
        <DecryptReveal copyable value={wallet.encPassword} />
      }/>
    </Descriptions.Item>

    {/* Wallet Encrypted Private key */}
    <Descriptions.Item label={t("myWallets.info.encPrivatekey")}>
      <OptionalField value={
        <DecryptReveal copyable value={wallet.encPrivatekey} />
      }/>
    </Descriptions.Item>

    {/* Wallet Saved */}
    <Descriptions.Item label={t("myWallets.info.saved")}>
      <BooleanText value={!wallet.dontSave} />
    </Descriptions.Item>
  </Descriptions>;
}

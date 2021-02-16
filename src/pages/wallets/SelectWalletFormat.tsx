import React from "react";
import { Select } from "antd";

import { useSelector } from "react-redux";
import { RootState } from "../../store";

import { useTranslation } from "react-i18next";
import { SettingsState } from "../../utils/settings";

import { WalletFormatName, ADVANCED_FORMATS } from "../../krist/wallets/formats/WalletFormat";

interface Props {
  initialFormat: WalletFormatName;
}

export function getSelectWalletFormat({ initialFormat }: Props): JSX.Element {
  const advancedWalletFormats = useSelector((s: RootState) => (s.settings as SettingsState).walletFormats);
  const { t } = useTranslation();

  return <Select>
    <Select.Option value="kristwallet">{t("addWallet.walletFormatKristWallet")}</Select.Option>

    {(advancedWalletFormats || ADVANCED_FORMATS.includes(initialFormat)) && <>
      <Select.Option value="kristwallet_username_appendhashes">{t("addWallet.walletFormatKristWalletUsernameAppendhashes")}</Select.Option>
      <Select.Option value="kristwallet_username">{t("addWallet.walletFormatKristWalletUsername")}</Select.Option>
      <Select.Option value="jwalelset">{t("addWallet.walletFormatJwalelset")}</Select.Option>
    </>}

    <Select.Option value="api">{t("addWallet.walletFormatApi")}</Select.Option>
  </Select>;
}

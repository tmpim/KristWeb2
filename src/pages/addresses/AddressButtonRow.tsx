// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Button, Tooltip } from "antd";
import { SendOutlined, SwapOutlined, UserAddOutlined, EditOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { isV1Address } from "@utils/currency";

import { KristAddressWithNames } from "@api/lookup";
import { Wallet } from "@wallets";
import { WalletEditButton } from "../wallets/WalletEditButton";
import { SendTransactionModalLink } from "@comp/transactions/SendTransactionModalLink";

interface Props {
  address: KristAddressWithNames;
  myWallet?: Wallet;
}

export function AddressButtonRow({ address, myWallet }: Props): JSX.Element {
  const { t } = useTranslation();

  const isV1 = address && isV1Address(address.address);

  const sendButton = <Button
    type="primary"
    icon={myWallet ? <SwapOutlined /> : <SendOutlined />}
    disabled={isV1}
  >
    {t(myWallet ? "address.buttonTransferKrist" : "address.buttonSendKrist",
      { address: address.address })}
  </Button>;

  return <>
    {/* Send/transfer Krist button */}
    {isV1
      ? ( // Disable the button and show a tooltip for V1 addresses
        <Tooltip title={t("address.tooltipV1Address")}>
          {sendButton}
        </Tooltip>
      )
      : ( // Otherwise, enable the button
        <SendTransactionModalLink to={address.address}>
          {sendButton}
        </SendTransactionModalLink>
      )}

    {/* Add contact/edit wallet button */}
    {/* TODO: Change this to edit if they're already a contact */}
    {myWallet
      ? (
        <WalletEditButton wallet={myWallet}>
          <Button icon={<EditOutlined />}>{t("address.buttonEditWallet")}</Button>
        </WalletEditButton>
      )
      : (
        <Button icon={<UserAddOutlined />} className="nyi">
          {t("address.buttonAddContact")}
        </Button>
      )}
  </>;
}

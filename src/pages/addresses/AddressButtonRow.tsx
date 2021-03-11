// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Button } from "antd";
import { SendOutlined, SwapOutlined, UserAddOutlined, EditOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { KristAddressWithNames } from "@api/lookup";
import { Wallet } from "@wallets";
import { WalletEditButton } from "../wallets/WalletEditButton";

interface Props {
  address: KristAddressWithNames;
  myWallet?: Wallet;
}

export function AddressButtonRow({ address, myWallet }: Props): JSX.Element {
  const { t } = useTranslation();

  return <>
    {/* Send/transfer Krist button */}
    {myWallet
      ? (
        <Button type="primary" icon={<SwapOutlined />} className="nyi">
          {t("address.buttonTransferKrist", { address: address.address })}
        </Button>
      )
      : (
        <Button type="primary" icon={<SendOutlined />} className="nyi">
          {t("address.buttonSendKrist", { address: address.address })}
        </Button>
      )}

    {/* Add friend/edit wallet button */}
    {/* TODO: Change this to edit if they're already a friend */}
    {myWallet
      ? (
        <WalletEditButton wallet={myWallet}>
          <Button icon={<EditOutlined />}>{t("address.buttonEditWallet")}</Button>
        </WalletEditButton>
      )
      : (
        <Button icon={<UserAddOutlined />} className="nyi">
          {t("address.buttonAddFriend")}
        </Button>
      )}
  </>;
}

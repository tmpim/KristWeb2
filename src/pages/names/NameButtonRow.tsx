// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Button } from "antd";
import { SendOutlined, SwapOutlined, EditOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { KristName } from "@api/types";
import { Wallet } from "@wallets";
import { SendTransactionModalLink } from "@comp/transactions/SendTransactionModalLink";
import { NameEditModalLink } from "./mgmt/NameEditModalLink";

interface Props {
  name: KristName;
  nameWithSuffix: string;
  myWallet?: Wallet;
}

export function NameButtonRow({ name, nameWithSuffix, myWallet }: Props): JSX.Element {
  const { t } = useTranslation();

  return <>
    {/* Send/transfer Krist button */}
    <SendTransactionModalLink to={nameWithSuffix}>
      <Button
        type="primary"
        icon={myWallet
          ? <SwapOutlined />
          : <SendOutlined />}
      >
        {t(
          myWallet
            ? "name.buttonTransferKrist"
            : "name.buttonSendKrist",
          { name: nameWithSuffix }
        )}
      </Button>
    </SendTransactionModalLink>

    {/* If we're the name owner, show the management buttons */}
    {/* Update A record button */}
    {myWallet && (
      <NameEditModalLink
        mode="update"
        name={name.name}
        aRecord={name.a}
      >
        <Button icon={<EditOutlined />}>
          {t("name.buttonARecord")}
        </Button>
      </NameEditModalLink>
    )}

    {/* Transfer name button */}
    {myWallet && (
      <NameEditModalLink
        mode="transfer"
        name={name.name}
      >
        <Button danger>
          {t("name.buttonTransferName")}
        </Button>
      </NameEditModalLink>
    )}
  </>;
}

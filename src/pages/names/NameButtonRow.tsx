// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Button } from "antd";
import { SendOutlined, SwapOutlined, EditOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { KristName } from "@api/types";
import { Wallet } from "@wallets";

interface Props {
  name: KristName;
  nameWithSuffix: string;
  myWallet?: Wallet;
}

// TODO: _name is currently unused, but will be used when these buttons can
//       actually do something
export function NameButtonRow({ name: _name, nameWithSuffix, myWallet }: Props): JSX.Element {
  const { t } = useTranslation();

  return <>
    {/* Send/transfer Krist button */}
    {myWallet
      ? (
        <Button type="primary" icon={<SwapOutlined />} className="nyi">
          {t("name.buttonTransferKrist", { name: nameWithSuffix })}
        </Button>
      )
      : (
        <Button type="primary" icon={<SendOutlined />} className="nyi">
          {t("name.buttonSendKrist", { name: nameWithSuffix })}
        </Button>
      )}

    {/* If we're the name owner, show the management buttons */}
    {/* Update A record button */}
    {myWallet && (
      <Button icon={<EditOutlined />} className="nyi">
        {t("name.buttonARecord")}
      </Button>
    )}

    {/* Transfer name button */}
    {myWallet && (
      <Button danger className="nyi">
        {t("name.buttonTransferName")}
      </Button>
    )}
  </>;
}

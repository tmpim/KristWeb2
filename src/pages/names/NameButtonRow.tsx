// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect } from "react";
import { Button, Menu, Space } from "antd";
import { SendOutlined, SwapOutlined, EditOutlined } from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { KristName } from "@api/types";

import { useTopMenuOptions } from "@layout/nav/TopMenu";
import { useAuth } from "@comp/auth";
import { OpenEditNameFn } from "./mgmt/NameEditModalLink";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";

interface Props {
  name: KristName;
  nameWithSuffix: string;
  myWallet: boolean;

  openNameEdit: OpenEditNameFn;
  openSendTx: OpenSendTxFn;
}

export function NameButtonRow({
  name,
  nameWithSuffix,
  myWallet,

  openNameEdit,
  openSendTx
}: Props): JSX.Element {
  const { t, tStr, tKey } = useTFns("name.");

  const promptAuth = useAuth();

  const [usingTopMenu, set, unset] = useTopMenuOptions();
  useEffect(() => {
    set(<>
      {/* Send/transfer Krist */}
      <Menu.Item
        icon={myWallet ? <SwapOutlined /> : <SendOutlined />}
        onClick={() => promptAuth(false, () =>
          openSendTx(undefined, nameWithSuffix))}
      >
        {t(
          tKey(myWallet ? "buttonTransferKrist" : "buttonSendKrist"),
          { name: nameWithSuffix }
        )}
      </Menu.Item>

      {myWallet && <Menu.Divider />}

      {/* Update A record */}
      {myWallet && (
        <Menu.Item
          icon={<EditOutlined />}
          onClick={() => promptAuth(false, () =>
            openNameEdit("update", name.name, name.a))}
        >
          {tStr("buttonData")}
        </Menu.Item>
      )}

      {/* Transfer name record */}
      {myWallet && (
        <Menu.Item
          icon={<SendOutlined />}
          danger
          onClick={() => promptAuth(false, () =>
            openNameEdit("transfer", name.name))}
        >
          {tStr("buttonTransferName")}
        </Menu.Item>
      )}
    </>);
    return unset;
  }, [
    t, tStr, tKey, set, unset, nameWithSuffix, openSendTx, openNameEdit,
    name.name, name.a, myWallet, promptAuth
  ]);

  return <>
    {/* Only display the buttons on desktop */}
    {!usingTopMenu && <Buttons
      name={name}
      nameWithSuffix={nameWithSuffix}
      myWallet={myWallet}

      openNameEdit={openNameEdit}
      openSendTx={openSendTx}
    />}
  </>;
}

function Buttons({
  name,
  nameWithSuffix,
  myWallet,

  openNameEdit,
  openSendTx
}: Props): JSX.Element {
  const { t, tStr, tKey } = useTFns("name.");

  const promptAuth = useAuth();

  return <Space wrap>
    {/* Send/transfer Krist button */}
    <Button
      type="primary"
      icon={myWallet
        ? <SwapOutlined />
        : <SendOutlined />}
      onClick={() => promptAuth(false, () =>
        openSendTx(undefined, nameWithSuffix))}
    >
      {t(
        tKey(myWallet ? "buttonTransferKrist" : "buttonSendKrist"),
        { name: nameWithSuffix }
      )}
    </Button>

    {/* If we're the name owner, show the management buttons */}
    {/* Update A record button */}
    {myWallet && (
      <Button
        icon={<EditOutlined />}
        onClick={() => promptAuth(false, () =>
          openNameEdit("update", name.name, name.a))}
      >
        {tStr("buttonData")}
      </Button>
    )}

    {/* Transfer name button */}
    {myWallet && (
      <Button
        danger
        onClick={() => promptAuth(false, () =>
          openNameEdit("transfer", name.name))}
      >
        {tStr("buttonTransferName")}
      </Button>
    )}
  </Space>;
}

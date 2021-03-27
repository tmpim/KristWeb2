// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect } from "react";
import { Button, Tooltip, Menu } from "antd";
import { SendOutlined, SwapOutlined, UserAddOutlined, EditOutlined } from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { isV1Address } from "@utils/currency";

import { Wallet } from "@wallets";
import { Contact } from "@contacts";

import { useTopMenuOptions } from "@layout/nav/TopMenu";
import { useAuth } from "@comp/auth";
import { OpenEditWalletFn } from "@pages/wallets/WalletEditButton";
import { OpenEditContactFn } from "@pages/contacts/ContactEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";

interface Props {
  address: string;
  myWallet?: Wallet;
  myContact?: Contact;

  openEditWallet: OpenEditWalletFn;
  openEditContact: OpenEditContactFn;
  openSendTx: OpenSendTxFn;
}

export function AddressButtonRow({
  address,
  myWallet,
  myContact,

  openEditWallet,
  openEditContact,
  openSendTx
}: Props): JSX.Element {
  const { t, tStr, tKey } = useTFns("address.");

  const isV1 = isV1Address(address);

  const promptAuth = useAuth();

  const [usingTopMenu, set, unset] = useTopMenuOptions();
  useEffect(() => {
    set(<>
      {/* Send/transfer Krist */}
      <Menu.Item
        icon={myWallet ? <SwapOutlined /> : <SendOutlined />}
        disabled={isV1}
        onClick={() => promptAuth(false, () =>
          openSendTx(undefined, address))}
      >
        {t(
          tKey(myWallet ? "buttonTransferKrist" : "buttonSendKrist"),
          { address }
        )}
      </Menu.Item>

      {/* Add contact/edit wallet */}
      {myWallet
        ? (
          <Menu.Item
            icon={<EditOutlined />}
            onClick={() => promptAuth(true, () => openEditWallet(myWallet))}
          >
            {tStr("buttonEditWallet")}
          </Menu.Item>
        )
        : (
          <Menu.Item
            icon={myContact ? <EditOutlined /> : <UserAddOutlined />}
            onClick={() => openEditContact(address, myContact)}
          >
            {tStr(myContact ? "buttonEditContact" : "buttonAddContact")}
          </Menu.Item>
        )
      }
    </>);
    return unset;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    t, tStr, tKey, set, unset, address, openSendTx, openEditWallet,
    openEditContact, isV1, promptAuth, myContact?.id, myWallet?.id
  ]);

  return <>
    {/* Only display the buttons on desktop */}
    {!usingTopMenu && <Buttons
      address={address}
      myWallet={myWallet}
      myContact={myContact}
      isV1={isV1}

      openEditWallet={openEditWallet}
      openEditContact={openEditContact}
      openSendTx={openSendTx}
    />}
  </>;
}

function Buttons({
  address,
  myWallet,
  myContact,
  isV1,

  openEditWallet,
  openEditContact,
  openSendTx
}: Props & { isV1: boolean }): JSX.Element {
  const { t, tStr, tKey } = useTFns("address.");

  const promptAuth = useAuth();

  const sendButton = <Button
    type="primary"
    icon={myWallet ? <SwapOutlined /> : <SendOutlined />}
    disabled={isV1}
    onClick={() => promptAuth(false, () =>
      openSendTx(undefined, address))}
  >
    {t(
      tKey(myWallet ? "buttonTransferKrist" : "buttonSendKrist"),
      { address }
    )}
  </Button>;

  return <>
    {/* Send/transfer Krist button */}
    {isV1
      ? ( // Disable the button and show a tooltip for V1 addresses
        <Tooltip title={tStr("tooltipV1Address")}>
          {sendButton}
        </Tooltip>
      )
      : sendButton // Otherwise, enable the button
    }

    {/* Add contact/edit wallet button */}
    {myWallet
      ? (
        <Button
          icon={<EditOutlined />}
          onClick={() => promptAuth(true, () => openEditWallet(myWallet))}
        >
          {tStr("buttonEditWallet")}
        </Button>
      )
      : (
        <Button
          icon={myContact ? <EditOutlined /> : <UserAddOutlined />}
          onClick={() => openEditContact(address, myContact)}
        >
          {tStr(myContact ? "buttonEditContact" : "buttonAddContact")}
        </Button>
      )}
  </>;
}

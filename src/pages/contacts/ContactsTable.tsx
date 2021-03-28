// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo, useCallback } from "react";
import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";

import { useTFns, TStrFn } from "@utils/i18n";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";

import { useContacts, Contact } from "@contacts";
import { ContactActions } from "./ContactActions";
import { ContactMobileItem } from "./ContactMobileItem";

import { OpenEditContactFn } from "./ContactEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";

import { keyedNullSort } from "@utils";
import { useSimpleMobileList, RenderItem } from "@utils/table/table";

interface Props {
  openEditContact: OpenEditContactFn;
  openSendTx: OpenSendTxFn;
}

function getColumns(
  tStr: TStrFn,
  openEditContact: OpenEditContactFn,
  openSendTx: OpenSendTxFn
): ColumnsType<Contact> {
  return [
    // Label
    {
      title: tStr("columnLabel"),
      dataIndex: "label", key: "label",
      sorter: keyedNullSort("label", true)
    },

    // Address
    {
      title: tStr("columnAddress"),
      dataIndex: "address", key: "address",

      render: address => (
        <ContextualAddress
          address={address}
          wallet={false}
          contact={false}
        />
      ),
      sorter: (a, b) => a.address.localeCompare(b.address)
    },

    // Actions
    {
      key: "actions",
      width: 80,

      render: (_, contact) => (
        <ContactActions
          contact={contact}
          openEditContact={openEditContact}
          openSendTx={openSendTx}
        />
      )
    }
  ];
}

export function ContactsTable({
  openEditContact,
  openSendTx
}: Props): JSX.Element {
  const { contacts } = useContacts();
  const contactValues = Object.values(contacts);

  const renderMobileItem: RenderItem<Contact> = useCallback(contact => (
    <ContactMobileItem
      contact={contact}
      openEditContact={openEditContact}
      openSendTx={openSendTx}
    />
  ), [openEditContact, openSendTx]);

  const { isMobile, list } = useSimpleMobileList(
    false, contactValues, "id", "address", false, renderMobileItem
  );

  return isMobile && list
    ? list
    : <DesktopView
      contacts={contactValues}
      openEditContact={openEditContact}
      openSendTx={openSendTx}
    />;
}

interface DesktopViewProps extends Props {
  contacts: Contact[];
}
function DesktopView({
  contacts,
  openEditContact,
  openSendTx
}: DesktopViewProps): JSX.Element {
  const { tStr } = useTFns("addressBook.");

  const columns = useMemo(() => getColumns(
    tStr, openEditContact, openSendTx
  ), [tStr, openEditContact, openSendTx]);

  return <Table
    size="small"
    scroll={{ x: true }}

    dataSource={contacts}
    rowKey="id"

    pagination={{
      size: "default"
    }}

    columns={columns}
  />;
}



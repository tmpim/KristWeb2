// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Table } from "antd";

import { useTFns } from "@utils/i18n";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";

import { useContacts } from "@contacts";
import { ContactActions } from "./ContactActions";
import { OpenEditContactFn } from "./ContactEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";

import { keyedNullSort } from "@utils";

interface Props {
  openEditContact: OpenEditContactFn;
  openSendTx: OpenSendTxFn;
}

export function ContactsTable({
  openEditContact,
  openSendTx
}: Props): JSX.Element {
  const { tStr } = useTFns("addressBook.");
  const { contacts } = useContacts();

  return <Table
    size="small"

    dataSource={Object.values(contacts)}
    rowKey="id"

    pagination={{
      size: "default"
    }}

    columns={[
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
    ]}
  />;
}


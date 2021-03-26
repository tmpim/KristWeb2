// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useCallback, useMemo } from "react";
import { Modal, Dropdown, Menu } from "antd";
import {
  EditOutlined, DeleteOutlined, ExclamationCircleOutlined, SendOutlined
} from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { OpenEditContactFn } from "./ContactEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";

import { Contact, deleteContact } from "@contacts";

interface Props {
  contact: Contact;
  openEditContact: OpenEditContactFn;
  openSendTx: OpenSendTxFn;
}

export function ContactActions({
  contact,
  openEditContact,
  openSendTx,
}: Props): JSX.Element {
  const { t, tStr } = useTFns("addressBook.");

  const showContactDeleteConfirm = useCallback((): void => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,

      title: tStr("actionsDeleteConfirm"),

      onOk: () => deleteContact(contact),
      okText: t("dialog.yes"),
      okType: "danger",
      cancelText: t("dialog.no")
    });
  }, [t, tStr, contact]);

  const memoDropdown = useMemo(() => <Dropdown.Button
    className="table-actions contact-actions"

    buttonsRender={([leftButton, rightButton]) => [
      // Edit contact button
      <AuthorisedAction
        key="leftButton"
        encrypt
        onAuthed={() => openEditContact(contact)}
      >
        {React.cloneElement(leftButton as React.ReactElement<any>, {
          className: "ant-btn-left"
        })}
      </AuthorisedAction>,

      // Dropdown button
      rightButton
    ]}

    trigger={["click"]}

    overlay={(
      <Menu>
        {/* Send tx button */}
        <Menu.Item key="1">
          <AuthorisedAction
            onAuthed={() => openSendTx(undefined, contact.address)}
          >
            <div><SendOutlined /> {tStr("actionsSendTransaction")}</div>
          </AuthorisedAction>
        </Menu.Item>

        <Menu.Divider />

        {/* Delete button */}
        <Menu.Item key="3" danger onClick={() => showContactDeleteConfirm()}>
          <DeleteOutlined /> {tStr("actionsDelete")}
        </Menu.Item>
      </Menu>
    )}
  >
    {/* Edit button */}
    <EditOutlined />
  </Dropdown.Button>, [
    tStr, contact, showContactDeleteConfirm, openEditContact, openSendTx
  ]);

  return memoDropdown;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useCallback, useMemo } from "react";
import { Collapse, Menu } from "antd";
import {
  ProfileOutlined, SendOutlined, EditOutlined, DeleteOutlined
} from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { useHistory } from "react-router-dom";

import { Contact } from "@contacts";
import {
  useAddressPrefix, useNameSuffix,
  isValidAddress, getNameParts
} from "@utils/krist";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";

import { useAuth } from "@comp/auth";
import { OpenEditContactFn } from "./ContactEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";
import { showContactDeleteConfirmModal } from "./ContactActions";

interface Props {
  contact: Contact;

  openEditContact: OpenEditContactFn;
  openSendTx: OpenSendTxFn;
}

export function ContactMobileItem({
  contact,
  openEditContact,
  openSendTx
}: Props): JSX.Element {
  const itemHead = useMemo(() => (
    <div className="contact-mobile-item-header">
      {/* Label, if possible */}
      {contact.label && <span className="contact-label">
        {contact.label}
      </span>}

      {/* Address */}
      <div className="contact-info-row">
        {/* Address */}
        <ContextualAddress
          address={contact.address}
          wallet={false}
          contact={false}
          noLink
          noTooltip
        />
      </div>
    </div>
  ), [contact.address, contact.label]);

  return <Collapse ghost className="card-list-item mobile-item-collapse contact-mobile-item">
    <Collapse.Panel key={contact.id} showArrow={false} header={itemHead}>
      <ContactMobileItemActions
        contact={contact}
        openEditContact={openEditContact}
        openSendTx={openSendTx}
      />
    </Collapse.Panel>
  </Collapse>;
}

function ContactMobileItemActions({
  contact,
  openEditContact,
  openSendTx
}: Props): JSX.Element {
  const { t, tStr } = useTFns("addressBook.");

  const history = useHistory();
  const promptAuth = useAuth();

  const showContactDeleteConfirm = useCallback(
    () => showContactDeleteConfirmModal(t, tStr, contact),
    [t, tStr, contact]
  );

  const addressPrefix = useAddressPrefix();
  const nameSuffix = useNameSuffix();

  const isAddress = isValidAddress(addressPrefix, contact.address);
  const nameParts = getNameParts(nameSuffix, contact.address);

  const contactLink = !isAddress && nameParts?.name
    ? `/network/names/${encodeURIComponent(nameParts.name)}`
    : `/network/addresses/${encodeURIComponent(contact.address)}`;

  return <Menu selectable={false}>
    {/* View address or name */}
    <Menu.Item key="1" icon={<ProfileOutlined />}
      onClick={() => history.push(contactLink)}>
      {tStr(isAddress ? "actionsViewAddress" : "actionsViewName")}
    </Menu.Item>

    {/* Send Krist */}
    <Menu.Item key="2" icon={<SendOutlined />}
      onClick={() => promptAuth(false, () =>
        openSendTx(undefined, contact.address))}>
      {tStr("actionsSendTransaction")}
    </Menu.Item>

    <Menu.Divider />

    {/* Edit contact */}
    <Menu.Item key="3" icon={<EditOutlined />}
      onClick={() => promptAuth(false, () =>
        openEditContact(undefined, contact))}>
      {tStr("actionsEditTooltip")}
    </Menu.Item>

    <Menu.Divider />

    {/* Delete wallet */}
    <Menu.Item key="4" danger icon={<DeleteOutlined />}
      onClick={showContactDeleteConfirm}>
      {tStr("actionsDelete")}
    </Menu.Item>
  </Menu>;
}

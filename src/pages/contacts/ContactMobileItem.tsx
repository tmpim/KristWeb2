// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo } from "react";
import { Collapse } from "antd";

import { Contact } from "@contacts";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";

import { OpenEditContactFn } from "./ContactEditButton";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";

import { ContactMobileItemActions } from "./ContactsMobileItemActions";

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

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useTFns } from "@utils/i18n";

import { PageLayout } from "@layout/PageLayout";

import { useContacts } from "@contacts";

import { useContactsPageActions } from "./ContactsPageActions";
import { ContactsTable } from "./ContactsTable";

import { useEditContactModal } from "./ContactEditButton";
import { useSendTransactionModal } from "@comp/transactions/SendTransactionModalLink";

/** Contact count subtitle */
function ContactsPageSubtitle(): JSX.Element {
  const { t, tStr, tKey } = useTFns("addressBook.");
  const { contactAddressList } = useContacts();

  const count = contactAddressList.length;

  return <>{count > 0
    ? t(tKey("contactCount"), { count })
    : tStr("contactCountEmpty")
  }</>;
}

export function ContactsPage(): JSX.Element {
  const [openEditContact, editContactModal] = useEditContactModal();
  const [openSendTx, sendTxModal] = useSendTransactionModal();

  const extra = useContactsPageActions();

  return <PageLayout
    siteTitleKey="addressBook.title" titleKey="addressBook.title"
    subTitle={<ContactsPageSubtitle />}
    extra={extra}
  >
    <ContactsTable
      openEditContact={openEditContact}
      openSendTx={openSendTx}
    />

    {editContactModal}
    {sendTxModal}
  </PageLayout>;
}

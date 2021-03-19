// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { PageLayout } from "@layout/PageLayout";

import { useContacts } from "@contacts";

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

function ContactsPageExtraButtons(): JSX.Element {
  const { tStr } = useTFns("addressBook.");
  const [addContactVisible, setAddContactVisible] = useState(false);

  return <>
    {/* Add contact */}
    <Button type="primary" icon={<PlusOutlined />}>
      {tStr("buttonAddContact")}
    </Button>
    {/* TODO: modal */}
  </>;
}

export function ContactsPage(): JSX.Element {
  return <PageLayout
    siteTitleKey="addressBook.title" titleKey="addressBook.title"
    subTitle={<ContactsPageSubtitle />}
    extra={<ContactsPageExtraButtons />}
  >

  </PageLayout>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Button, Menu } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { useTopMenuOptions } from "@layout/nav/TopMenu";

import { AddContactModal } from "./AddContactModal";

interface ExtraButtonsProps {
  setAddContactVisible: Dispatch<SetStateAction<boolean>>;
}

function ContactsPageActions({
  setAddContactVisible
}: ExtraButtonsProps): JSX.Element {
  const { tStr } = useTFns("addressBook.");

  return <>
    {/* Add contact */}
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => setAddContactVisible(true)}
    >
      {tStr("buttonAddContact")}
    </Button>
  </>;
}

export function useContactsPageActions(): JSX.Element {
  const { tStr } = useTFns("addressBook.");

  const [addContactVisible, setAddContactVisible] = useState(false);

  const [usingTopMenu, set, unset] = useTopMenuOptions();
  useEffect(() => {
    set(<>
      {/* Add contact */}
      <Menu.Item onClick={() => setAddContactVisible(true)}>
        <PlusOutlined />{tStr("buttonAddContact")}
      </Menu.Item>
    </>);

    return unset;
  }, [tStr, set, unset]);

  return <>
    {!usingTopMenu && <ContactsPageActions
      setAddContactVisible={setAddContactVisible}
    />}

    <AddContactModal visible={addContactVisible} setVisible={setAddContactVisible} />
  </>;
}

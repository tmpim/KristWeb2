// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Dispatch, SetStateAction} from "react";
import { Button, Dropdown, Menu } from "antd";
import {
  DatabaseOutlined, DownOutlined, ImportOutlined, ExportOutlined
} from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { useMasterPassword } from "@wallets";

interface Props {
  setImportVisible: Dispatch<SetStateAction<boolean>>;
  setExportVisible: Dispatch<SetStateAction<boolean>>;
}

export function ManageBackupsDropdown({
  setImportVisible,
  setExportVisible
}: Props): JSX.Element {
  const { tStr } = useTFns("myWallets.");

  // Used to disable the export button if a master password hasn't been set up
  const { hasMasterPassword, salt, tester } = useMasterPassword();
  const allowExport = !!hasMasterPassword && !!salt && !!tester;

  return <>
    <Dropdown overlay={(
      <Menu>
        {/* Import backup button */}
        <Menu.Item key="1">
          <AuthorisedAction encrypt onAuthed={() => setImportVisible(true)}>
            <div><ImportOutlined /> {tStr("importBackup")}</div>
          </AuthorisedAction>
        </Menu.Item>

        {/* Export backup button */}
        <Menu.Item
          key="2"
          disabled={!allowExport}
          onClick={() => setExportVisible(true)}
        >
          <ExportOutlined /> {tStr("exportBackup")}
        </Menu.Item>
      </Menu>
    )}>
      <Button icon={<DatabaseOutlined />}>
        {tStr("manageBackups")} <DownOutlined />
      </Button>
    </Dropdown>
  </>;
}

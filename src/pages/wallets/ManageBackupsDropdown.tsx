// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Button, Dropdown, Menu } from "antd";
import {
  DatabaseOutlined, DownOutlined, ImportOutlined, ExportOutlined
} from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";

import { ImportBackupModal } from "../backup/ImportBackupModal";

export function ManageBackupsDropdown(): JSX.Element {
  const { tStr } = useTFns("myWallets.");

  const [importVisible, setImportVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);

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
        <Menu.Item key="2">
          <ExportOutlined /> {tStr("exportBackup")}
        </Menu.Item>
      </Menu>
    )}>
      <Button icon={<DatabaseOutlined />}>
        {tStr("manageBackups")} <DownOutlined />
      </Button>
    </Dropdown>

    <ImportBackupModal visible={importVisible} setVisible={setImportVisible} />
  </>;
}

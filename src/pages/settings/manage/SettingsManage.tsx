// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Menu } from "antd";
import {
  DatabaseOutlined, ImportOutlined, ExportOutlined, KeyOutlined
} from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { useMasterPassword } from "@wallets";

import { ImportBackupModal } from "../../backup/ImportBackupModal";
import { ExportBackupModal } from "../../backup/ExportBackupModal";
import { useResetMasterPasswordModal } from "./ResetMasterPassword";

export function useSettingsManage(): [JSX.Element[], JSX.Element] {
  const { tStr } = useTFns("settings.");

  const [importVisible, setImportVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);

  const { resetMasterPasswordCtx, openResetMasterPassword } =
    useResetMasterPasswordModal(() => setExportVisible(true));

  // Used to disable the export button if a master password hasn't been set up
  const { hasMasterPassword, salt, tester } = useMasterPassword();
  const allowExport = !!hasMasterPassword && !!salt && !!tester;

  const settings = [
    // Manage backups sub-menu
    <Menu.SubMenu
      key="sub-backups"
      icon={<DatabaseOutlined />}
      title={tStr("subMenuBackups")}
    >
      {/* Import backup */}
      <Menu.Item key="importBackup">
        <AuthorisedAction encrypt onAuthed={() => setImportVisible(true)}>
          <div><ImportOutlined/>{tStr("importBackup")}</div>
        </AuthorisedAction>
      </Menu.Item>

      {/* Export backup */}
      <Menu.Item key="exportBackup" disabled={!allowExport}
        onClick={() => setExportVisible(true)}>
        <div><ExportOutlined />{tStr("exportBackup")}</div>
      </Menu.Item>
    </Menu.SubMenu>,

    // Master password sub-menu
    <Menu.SubMenu
      key="sub-masterPassword"
      icon={<KeyOutlined />}
      title={tStr("subMenuMasterPassword")}
    >
      {/* Change master password */}
      <Menu.Item disabled key="changeMasterPassword" className="nyi">
        {tStr("changeMasterPassword")}
      </Menu.Item>

      {/* Reset master password */}
      <Menu.Item danger disabled={!allowExport} key="resetMasterPassword"
        onClick={openResetMasterPassword}>
        {tStr("resetMasterPassword")}
      </Menu.Item>
    </Menu.SubMenu>
  ];

  const ctx = <>
    <ImportBackupModal visible={importVisible} setVisible={setImportVisible} />
    <ExportBackupModal visible={exportVisible} setVisible={setExportVisible} />
    {resetMasterPasswordCtx}
  </>;

  return [settings, ctx];
}

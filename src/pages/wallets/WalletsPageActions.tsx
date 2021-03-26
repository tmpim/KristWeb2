// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Button, Menu } from "antd";
import { PlusOutlined, ImportOutlined, ExportOutlined } from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { useTopMenuOptions } from "@layout/nav/TopMenu";
import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { useMasterPassword } from "@wallets";

import { ManageBackupsDropdown } from "./ManageBackupsDropdown";
import { AddWalletModal } from "./AddWalletModal";
import { ImportBackupModal } from "../backup/ImportBackupModal";
import { ExportBackupModal } from "../backup/ExportBackupModal";

interface ExtraButtonsProps {
  setCreateWalletVisible: Dispatch<SetStateAction<boolean>>;
  setAddWalletVisible: Dispatch<SetStateAction<boolean>>;
  setImportVisible: Dispatch<SetStateAction<boolean>>;
  setExportVisible: Dispatch<SetStateAction<boolean>>;
}

function WalletsPageExtraButtons({
  setCreateWalletVisible,
  setAddWalletVisible,
  setImportVisible,
  setExportVisible
}: ExtraButtonsProps): JSX.Element {
  const { tStr } = useTFns("myWallets.");

  return <>
    {/* Manage backups */}
    <ManageBackupsDropdown
      setImportVisible={setImportVisible}
      setExportVisible={setExportVisible}
    />

    {/* Create wallet */}
    <AuthorisedAction encrypt onAuthed={() => setCreateWalletVisible(true)}>
      <Button type="primary" icon={<PlusOutlined />}>
        {tStr("createWallet")}
      </Button>
    </AuthorisedAction>

    {/* Add existing wallet */}
    <AuthorisedAction encrypt onAuthed={() => setAddWalletVisible(true)}>
      <Button ghost>{tStr("addExistingWallet")}</Button>
    </AuthorisedAction>
  </>;
}

export function useWalletsPageActions(): JSX.Element {
  const { tStr } = useTFns("myWallets.");

  const [createWalletVisible, setCreateWalletVisible] = useState(false);
  const [addWalletVisible, setAddWalletVisible] = useState(false);

  const [importVisible, setImportVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);

  // Used to disable the export button if a master password hasn't been set up
  const { hasMasterPassword, salt, tester } = useMasterPassword();
  const allowExport = !!hasMasterPassword && !!salt && !!tester;

  const [usingTopMenu, set, unset] = useTopMenuOptions();
  useEffect(() => {
    set(<>
      {/* Create wallet */}
      <Menu.Item>
        <AuthorisedAction encrypt onAuthed={() => setCreateWalletVisible(true)}>
          <div><PlusOutlined /><b>{tStr("createWallet")}</b></div>
        </AuthorisedAction>
      </Menu.Item>

      {/* Add existing wallet */}
      <Menu.Item>
        <AuthorisedAction encrypt onAuthed={() => setAddWalletVisible(true)}>
          <div><PlusOutlined />{tStr("addExistingWallet")}</div>
        </AuthorisedAction>
      </Menu.Item>

      {/* Backups */}
      <Menu.Divider />

      {/* Import backup */}
      <Menu.Item>
        <AuthorisedAction encrypt onAuthed={() => setImportVisible(true)}>
          <div><ImportOutlined />{tStr("importBackup")}</div>
        </AuthorisedAction>
      </Menu.Item>

      {/* Export backup */}
      <Menu.Item disabled={!allowExport} onClick={() => setExportVisible(true)}>
        <ExportOutlined />{tStr("exportBackup")}
      </Menu.Item>
    </>);
    return unset;
  }, [tStr, set, unset, allowExport]);

  return <>
    {/* Only display the buttons on desktop */}
    {!usingTopMenu && <WalletsPageExtraButtons
      setCreateWalletVisible={setCreateWalletVisible}
      setAddWalletVisible={setAddWalletVisible}
      setImportVisible={setImportVisible}
      setExportVisible={setExportVisible}
    />}

    <AddWalletModal create visible={createWalletVisible} setVisible={setCreateWalletVisible} setAddExistingVisible={setAddWalletVisible} />
    <AddWalletModal visible={addWalletVisible} setVisible={setAddWalletVisible} />
    <ImportBackupModal visible={importVisible} setVisible={setImportVisible} />
    <ExportBackupModal visible={exportVisible} setVisible={setExportVisible} />
  </>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Button, Alert } from "antd";
import { PageLayout } from "@layout/PageLayout";

import { ImportBackupModal } from "../backup/ImportBackupModal";
import { SendTransactionModal } from "../transactions/send/SendTransactionModal";
import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { NamePicker } from "@pages/names/mgmt/NamePicker";

import { useWallets, deleteWallet } from "@wallets";

import Debug from "debug";
const debug = Debug("kristweb:dev-page");

export function DevPage(): JSX.Element {
  const [importVisible, setImportVisible] = useState(false);
  const [sendTXVisible, setSendTXVisible] = useState(false);
  const { wallets } = useWallets();

  return <PageLayout
    title="Dev page"
    siteTitle="Dev page"
  >
    <Alert type="success" message="test" />
    <Alert type="success" message="test" showIcon />
    <Alert type="warning" message="test" />
    <Alert type="warning" message="test" showIcon />
    <Alert type="error" message="test" />
    <Alert type="error" message="test" showIcon />

    <br />

    {/* Open import backup modal */}
    <AuthorisedAction
      encrypt
      onAuthed={() => setImportVisible(true)}
    >
      <Button>Open import backup modal</Button>
    </AuthorisedAction>
    <ImportBackupModal visible={importVisible} setVisible={setImportVisible} />

    {/* Open send tx modal */}
    <AuthorisedAction onAuthed={() => setSendTXVisible(true)}>
      <Button>Open send tx modal</Button>
    </AuthorisedAction>
    <SendTransactionModal visible={sendTXVisible} setVisible={setSendTXVisible} />

    <br /><br />

    <NamePicker />

    <br /><br />

    {/* Delete all wallets with zero balance */}
    <Button danger onClick={() => {
      const toDelete = Object.values(wallets)
        .filter(w => !w.balance || w.balance === 0);

      debug("deleting wallets with zero balance: ", toDelete);

      toDelete.forEach(deleteWallet);
    }}>
      Delete all wallets with zero balance
    </Button>
  </PageLayout>;
}

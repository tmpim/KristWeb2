// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState } from "react";
import { Button } from "antd";
import { PageLayout } from "../../layout/PageLayout";

import { ImportBackupModal } from "../backup/ImportBackupModal";
import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { AddressPicker } from "@comp/addresses/AddressPicker";

import { useWallets, deleteWallet } from "@wallets";

import Debug from "debug";
const debug = Debug("kristweb:dev-page");

export function DevPage(): JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const { wallets } = useWallets();

  return <PageLayout
    title="Dev page"
    siteTitle="Dev page"
  >
    {/* Open import backup modal */}
    <AuthorisedAction
      encrypt
      onAuthed={() => setModalVisible(true)}
    >
      <Button>Open</Button>
    </AuthorisedAction>

    <ImportBackupModal visible={modalVisible} setVisible={setModalVisible} />

    <br /><br />

    <AddressPicker walletsOnly />
    <br /><br />
    <AddressPicker />

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

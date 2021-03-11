// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, FC } from "react";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { AddWalletModal } from "./AddWalletModal";

import { Wallet } from "@wallets";

interface Props {
  wallet: Wallet;
}

export const WalletEditButton: FC<Props> = ({ wallet, children }): JSX.Element => {
  const [editWalletVisible, setEditWalletVisible] = useState(false);

  return <>
    <AuthorisedAction
      encrypt
      onAuthed={() => setEditWalletVisible(true)}
      popoverPlacement="left"
    >
      {children}
    </AuthorisedAction>

    <AddWalletModal editing={wallet} visible={editWalletVisible} setVisible={setEditWalletVisible} />
  </>;
};

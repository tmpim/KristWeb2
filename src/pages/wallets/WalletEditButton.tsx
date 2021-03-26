// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useCallback, FC } from "react";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { AddWalletModal } from "./AddWalletModal";

import { Wallet } from "@wallets";

interface Props {
  wallet: Wallet;
}

export const WalletEditButton: FC<Props> = ({ wallet, children }): JSX.Element => {
  const [editWalletVisible, setEditWalletVisible] = useState(false);

  return <>
    <AuthorisedAction encrypt onAuthed={() => setEditWalletVisible(true)}>
      {children}
    </AuthorisedAction>

    <AddWalletModal editing={wallet} visible={editWalletVisible} setVisible={setEditWalletVisible} />
  </>;
};

export type OpenEditWalletFn = (wallet: Wallet) => void;
export type WalletEditHookRes = [
  OpenEditWalletFn,
  JSX.Element | null,
  (visible: boolean) => void
];

export function useEditWalletModal(): WalletEditHookRes {
  // The modal will only be rendered if it is opened at least once
  const [opened, setOpened] = useState(false);
  const [visible, setVisible] = useState(false);
  const [wallet, setWallet] = useState<Wallet>();

  const open = useCallback((wallet: Wallet) => {
    setWallet(wallet);
    setVisible(true);
    setOpened(true);
  }, []);

  const modal = opened
    ? <AddWalletModal editing={wallet} visible={visible} setVisible={setVisible} />
    : null;

  return [open, modal, setVisible];
}

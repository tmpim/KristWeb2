// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC, useState, useCallback } from "react";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { SendTransactionModal } from "@pages/transactions/send/SendTransactionModal";

import { Wallet } from "@wallets";

interface Props {
  from?: Wallet | string;
  to?: string;
}

export const SendTransactionModalLink: FC<Props> = ({
  from,
  to,
  children
}): JSX.Element => {
  const [modalVisible, setModalVisible] = useState(false);

  return <>
    <AuthorisedAction onAuthed={() => setModalVisible(true)}>
      {children}
    </AuthorisedAction>

    <SendTransactionModal
      visible={modalVisible}
      setVisible={setModalVisible}

      from={from}
      to={to}
    />
  </>;
};

export type OpenSendTxFn = (from?: Wallet | string, to?: string) => void;
export type SendTxHookRes = [
  OpenSendTxFn,
  JSX.Element | null,
  (visible: boolean) => void
];

interface FromTo {
  from?: Wallet | string;
  to?: string;
}

export function useSendTransactionModal(): SendTxHookRes {
  const [opened, setOpened] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fromTo, setFromTo] = useState<FromTo>({});

  const open = useCallback((from?: Wallet | string, to?: string) => {
    setFromTo({ from, to });
    setVisible(true);
    setOpened(true);
  }, []);

  const modal = opened
    ? <SendTransactionModal
      from={fromTo.from} to={fromTo.to}
      visible={visible} setVisible={setVisible}
    />
    : null;

  return [open, modal, setVisible];
}

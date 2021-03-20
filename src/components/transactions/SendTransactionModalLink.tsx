// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC, useState } from "react";

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

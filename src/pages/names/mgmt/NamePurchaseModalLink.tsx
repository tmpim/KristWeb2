// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC, useState } from "react";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { NamePurchaseModal } from "./NamePurchaseModal";

export const NamePurchaseModalLink: FC = ({ children }): JSX.Element => {
  const [modalVisible, setModalVisible] = useState(false);

  return <>
    <AuthorisedAction onAuthed={() => setModalVisible(true)}>
      {children}
    </AuthorisedAction>

    <NamePurchaseModal
      visible={modalVisible}
      setVisible={setModalVisible}
    />
  </>;
};

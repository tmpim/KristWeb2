// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC, useState } from "react";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { NameEditModal, Mode } from "./NameEditModal";

interface Props {
  name?: string;
  aRecord?: string | null;
  mode: Mode;
}

export const NameEditModalLink: FC<Props> = ({
  name,
  aRecord,
  mode,
  children
}): JSX.Element => {
  const [modalVisible, setModalVisible] = useState(false);

  return <>
    <AuthorisedAction onAuthed={() => setModalVisible(true)}>
      {children}
    </AuthorisedAction>

    <NameEditModal
      visible={modalVisible}
      setVisible={setModalVisible}

      name={name}
      aRecord={aRecord}
      mode={mode}
    />
  </>;
};

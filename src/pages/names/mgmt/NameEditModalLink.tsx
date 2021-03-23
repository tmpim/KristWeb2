// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC, useState, useCallback } from "react";

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


export type OpenEditNameFn = (
  mode: Mode,
  name?: string,
  aRecord?: string | null
) => void;

export type NameEditHookRes = [
  OpenEditNameFn,
  JSX.Element | null,
  (visible: boolean) => void
];

interface EditState {
  mode: Mode;
  name?: string;
  aRecord?: string | null;
}

export function useNameEditModal(): NameEditHookRes {
  // The modal will only be rendered if it is opened at least once
  const [opened, setOpened] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editState, setEditState] = useState<EditState>();

  const open: OpenEditNameFn = useCallback((mode, name, aRecord) => {
    setEditState({ mode, name, aRecord });
    setVisible(true);
    setOpened(true);
  }, []);

  const modal = opened
    ? (
      <NameEditModal
        visible={visible}
        setVisible={setVisible}

        name={editState!.name}
        aRecord={editState!.aRecord}
        mode={editState!.mode}
      />
    )
    : null;

  return [open, modal, setVisible];
}

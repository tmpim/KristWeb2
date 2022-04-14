// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC, useState, useCallback } from "react";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { NameEditModal, Mode } from "./NameEditModal";

interface Props {
  name?: string;
  data?: string | null;
  mode: Mode;
}

export const NameEditModalLink: FC<Props> = ({
  name,
  data,
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
      data={data}
      mode={mode}
    />
  </>;
};


export type OpenEditNameFn = (
  mode: Mode,
  name?: string,
  data?: string | null
) => void;

export type NameEditHookRes = [
  OpenEditNameFn,
  JSX.Element | null,
  (visible: boolean) => void
];

interface EditState {
  mode: Mode;
  name?: string;
  data?: string | null;
}

export function useNameEditModal(): NameEditHookRes {
  // The modal will only be rendered if it is opened at least once
  const [opened, setOpened] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editState, setEditState] = useState<EditState>();

  const open: OpenEditNameFn = useCallback((mode, name, data) => {
    setEditState({ mode, name, data });
    setVisible(true);
    setOpened(true);
  }, []);

  const modal = opened
    ? (
      <NameEditModal
        visible={visible}
        setVisible={setVisible}

        name={editState!.name}
        data={editState!.data}
        mode={editState!.mode}
      />
    )
    : null;

  return [open, modal, setVisible];
}

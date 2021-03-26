// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useCallback, createContext, FC } from "react";

import { useMasterPassword } from "@wallets";

import { AuthMasterPasswordModal } from "./AuthMasterPasswordModal";
import { SetMasterPasswordModal } from "./SetMasterPasswordModal";

export type PromptAuthFn = (encrypt: boolean | undefined, onAuthed?: () => void) => void;
export const AuthContext = createContext<PromptAuthFn | undefined>(undefined);

interface ModalProps {
  // Whether the modal text should say 'encrypt wallets' or 'decrypt wallets'
  encrypt: boolean | undefined;
  onAuthed?: () => void;
}

export const AuthProvider: FC = ({ children }) => {
  const { isAuthed, hasMasterPassword } = useMasterPassword();

  // Don't render the modal unless we absolutely have to
  const [clicked, setClicked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [modalProps, setModalProps] = useState<ModalProps>({ encrypt: false });

  const promptAuth: PromptAuthFn = useCallback((encrypt, onAuthed) => {
    if (isAuthed) {
      // Pass-through auth directly if already authed.
      onAuthed?.();
      return;
    }

    setModalProps({ encrypt, onAuthed });
    setModalVisible(true);
    setClicked(true);
  }, [isAuthed]);

  const submit = useCallback(() => {
    setModalVisible(false);
    modalProps.onAuthed?.();
  }, [modalProps]);

  return <AuthContext.Provider value={promptAuth}>
    {children}

    {clicked && !isAuthed && <>
      {hasMasterPassword
        ? <AuthMasterPasswordModal
          visible={modalVisible}
          encrypt={modalProps.encrypt}
          onCancel={() => setModalVisible(false)}
          onSubmit={submit}
        />
        : <SetMasterPasswordModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onSubmit={submit}
        />}
    </>}
  </AuthContext.Provider>;
};

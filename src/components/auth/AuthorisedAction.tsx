import React, { FunctionComponent, useState } from "react";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";

import { AuthMasterPasswordPopover } from "./AuthMasterPasswordPopover";
import { SetMasterPasswordModal } from "./SetMasterPasswordModal";

import "./AuthorisedAction.less";

interface Props {
  onAuthed?: () => void;
}

export const AuthorisedAction: FunctionComponent<Props> = ({ onAuthed, children }) => {
  const { isAuthed, hasMasterPassword }
    = useSelector((s: RootState) => s.walletManager, shallowEqual);

  // Don't render the modal and popover unless we absolutely have to
  const [clicked, setClicked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  if (isAuthed) {
    // The user is authed with their master password, just perform the action
    // directly:
    return <div onClick={onAuthed}>{children}</div>;
  } else if (!hasMasterPassword) {
    // The user does not yet have a master password, prompt them to create one:
    return <>
      <div onClick={() => { if (!clicked) { setClicked(true); } setModalVisible(true); }}>
        {children}
      </div>
      {clicked && <SetMasterPasswordModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={() => { setModalVisible(false); if (onAuthed) onAuthed(); }}
      />}
    </>;
  } else {
    // The user has a master password set but is not logged in, prompt them to
    // enter it:
    return <AuthMasterPasswordPopover
      onSubmit={() => { if (onAuthed) onAuthed(); }}
    >
      {children}
    </AuthMasterPasswordPopover>;
  }
};

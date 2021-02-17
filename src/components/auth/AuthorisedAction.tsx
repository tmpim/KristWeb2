import React, { FunctionComponent, useState } from "react";
import { TooltipPlacement } from "antd/lib/tooltip";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";

import { AuthMasterPasswordPopover } from "./AuthMasterPasswordPopover";
import { SetMasterPasswordModal } from "./SetMasterPasswordModal";

import "./AuthorisedAction.less";

interface Props {
  encrypt?: boolean;
  onAuthed?: () => void;
  popoverPlacement?: TooltipPlacement;
}

export const AuthorisedAction: FunctionComponent<Props> = ({ encrypt, onAuthed, popoverPlacement, children }) => {
  const { isAuthed, hasMasterPassword }
    = useSelector((s: RootState) => s.walletManager, shallowEqual);

  // Don't render the modal and popover unless we absolutely have to
  const [clicked, setClicked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  if (isAuthed) {
    // The user is authed with their master password, just perform the action
    // directly:
    return <a href="#" onClick={e => {
      e.preventDefault();
      if (onAuthed) onAuthed();
    }}>
      {children}
    </a>;
  } else if (!hasMasterPassword) {
    // The user does not yet have a master password, prompt them to create one:
    return <>
      <a href="#" onClick={e => {
        e.preventDefault();
        if (!clicked) setClicked(true);
        setModalVisible(true);
      }}>
        {children}
      </a>

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
      encrypt={encrypt}
      onSubmit={() => { if (onAuthed) onAuthed(); }}
      placement={popoverPlacement}
    >
      {children}
    </AuthMasterPasswordPopover>;
  }
};

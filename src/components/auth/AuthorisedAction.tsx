// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { FC, useState } from "react";
import { TooltipPlacement } from "antd/lib/tooltip";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@store";

import { AuthMasterPasswordPopover } from "./AuthMasterPasswordPopover";
import { SetMasterPasswordModal } from "./SetMasterPasswordModal";

import "./AuthorisedAction.less";

import Debug from "debug";
const debug = Debug("kristweb:authorised-action");

interface Props {
  encrypt?: boolean;
  onAuthed?: () => void;
  popoverPlacement?: TooltipPlacement;
  children: React.ReactNode;
}

export const AuthorisedAction: FC<Props> = ({ encrypt, onAuthed, popoverPlacement, children }) => {
  const { isAuthed, hasMasterPassword }
    = useSelector((s: RootState) => s.masterPassword, shallowEqual);

  // Don't render the modal and popover unless we absolutely have to
  const [clicked, setClicked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // This is used to pass the 'onClick' prop down to the child. The child MUST
  // support the onClick prop.
  // NOTE: If the child is a custom component, make sure it passes `...props`
  //       down to its child.
  // TODO: Support multiple children?
  const child = React.Children.only(children) as React.ReactElement;

  if (isAuthed) {
    // The user is authed with their master password, just perform the action
    // directly:
    return React.cloneElement(child, { onClick: (e: MouseEvent) => {
      e.preventDefault();
      debug("authorised action occurred: was already authed");

      if (onAuthed) onAuthed();
    }});
  } else if (!hasMasterPassword) {
    // The user does not yet have a master password, prompt them to create one:
    return <>
      {React.cloneElement(child, { onClick: (e: MouseEvent) => {
        e.preventDefault();
        debug("authorised action postponed: no master password set");

        if (!clicked) setClicked(true);
        setModalVisible(true);
      }})}

      {clicked && <SetMasterPasswordModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={() => {
          debug("authorised action occurred: master password now set, continuing with action");

          setModalVisible(false);
          if (onAuthed) onAuthed();
        }}
      />}
    </>;
  } else {
    // The user has a master password set but is not logged in, prompt them to
    // enter it:
    return <AuthMasterPasswordPopover
      encrypt={encrypt}
      onSubmit={() => {
        debug("authorised action occurred: master password provided");
        if (onAuthed) onAuthed();
      }}
      placement={popoverPlacement}
    >
      {children}
    </AuthMasterPasswordPopover>;
  }
};

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { FC, useState } from "react";
import { Grid } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";

import { useMasterPassword } from "@wallets";
import { useBooleanSetting } from "@utils/settings";

import { AuthMasterPasswordPopover } from "./AuthMasterPasswordPopover";
import { AuthMasterPasswordModal } from "./AuthMasterPasswordModal";
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
  const { isAuthed, hasMasterPassword } = useMasterPassword();

  // Don't render the modal and popover unless we absolutely have to
  const [clicked, setClicked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  // Determine whether to use a popover or a modal for auth
  const bps = Grid.useBreakpoint();
  const alwaysModal = useBooleanSetting("modalAuth");

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
      onAuthed?.();
    }});
  } else if (!hasMasterPassword) {
    // The user does not yet have a master password, prompt them to create one:
    return <>
      {React.cloneElement(child, { onClick: (e: MouseEvent) => {
        e.preventDefault();
        debug("authorised action postponed: no master password set");

        setClicked(true);
        setModalVisible(true);
      }})}

      {clicked && <SetMasterPasswordModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={() => {
          debug("authorised action occurred: master password now set, continuing with action");

          setModalVisible(false);
          onAuthed?.();
        }}
      />}
    </>;
  } else if (!bps.md || alwaysModal) {
    // The user has a master password set but is not logged in, prompt them to
    // enter it. Show a modal on mobile:
    return <>
      {React.cloneElement(child, { onClick: (e: MouseEvent) => {
        e.preventDefault();
        debug("authorised action postponed: no master password set");

        setClicked(true);
        setAuthModalVisible(true);
      }})}

      {clicked && <AuthMasterPasswordModal
        visible={authModalVisible}
        onCancel={() => setAuthModalVisible(false)}
        onSubmit={() => {
          debug("authorised action occurred: master password now set, continuing with action");

          setAuthModalVisible(false);
          onAuthed?.();
        }}
      />}
    </>;
  } else {
    // Show a popover on desktop:
    return <AuthMasterPasswordPopover
      encrypt={encrypt}
      onSubmit={() => {
        debug("authorised action occurred: master password provided");
        onAuthed?.();
      }}
      placement={popoverPlacement}
    >
      {children}
    </AuthMasterPasswordPopover>;
  }
};

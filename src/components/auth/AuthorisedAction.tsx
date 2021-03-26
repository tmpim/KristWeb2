// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { FC, useContext } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { AuthContext } from "./AuthContext";

interface Props {
  encrypt?: boolean;
  onAuthed?: () => void;
  children: React.ReactNode;
}

export const AuthorisedAction: FC<Props> = ({ encrypt, onAuthed, children }) => {
  const isAuthed = useSelector((s: RootState) => s.masterPassword.isAuthed);
  const promptAuth = useContext(AuthContext);

  // This is used to pass the 'onClick' prop down to the child. The child MUST
  // support the onClick prop.
  // NOTE: If the child is a custom component, make sure it passes `...props`
  //       down to its child.
  const child = React.Children.only(children) as React.ReactElement;

  // Wrap the single child element and override onClick
  if (isAuthed) {
    // Already authed, run onAuthed immediately
    return React.cloneElement(child, { onClick: (e: MouseEvent) => {
      e.preventDefault();
      onAuthed?.();
    }});
  } else {
    // Not authed, prompt for either set password or auth password
    return React.cloneElement(child, { onClick: (e: MouseEvent) => {
      e.preventDefault();
      promptAuth?.(encrypt, onAuthed);
    }});
  }
};

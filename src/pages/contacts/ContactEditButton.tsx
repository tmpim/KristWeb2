// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, FC } from "react";

import { AddContactModal } from "./AddContactModal";

import { Contact } from "@contacts";

interface Props {
  address?: string;
  contact?: Contact;
}

export const ContactEditButton: FC<Props> = ({
  address,
  contact,
  children
}): JSX.Element => {
  const [editContactVisible, setEditContactVisible] = useState(false);

  const child = React.Children.only(children) as React.ReactElement;

  return <>
    {React.cloneElement(child, { onClick: (e: MouseEvent) => {
      e.preventDefault();
      setEditContactVisible(true);
    }})}

    <AddContactModal
      address={address}
      editing={contact}
      visible={editContactVisible}
      setVisible={setEditContactVisible}
    />
  </>;
};

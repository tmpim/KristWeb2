// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useCallback, FC } from "react";

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

export type OpenEditContactFn = (address?: string, contact?: Contact) => void;
export type ContactEditHookRes = [
  OpenEditContactFn,
  JSX.Element | null,
  (visible: boolean) => void
];

export function useEditContactModal(): ContactEditHookRes {
  const [opened, setOpened] = useState(false);
  const [visible, setVisible] = useState(false);
  const [address, setAddress] = useState<string>();
  const [contact, setContact] = useState<Contact>();

  const open = useCallback((address?: string, contact?: Contact) => {
    setAddress(address);
    setContact(contact);
    setVisible(true);
    setOpened(true);
  }, []);

  const modal = opened
    ? <AddContactModal
      address={address}
      editing={contact}
      visible={visible}
      setVisible={setVisible}
    />
    : null;

  return [open, modal, setVisible];
}

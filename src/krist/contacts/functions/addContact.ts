// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { v4 as uuid } from "uuid";

import { store } from "@app";
import * as actions from "@actions/ContactsActions";

import { Contact, ContactNew, saveContact } from "..";
import { broadcastAddContact } from "@global/StorageBroadcast";

/**
 * Adds a new contact, saving it to locale storage, and dispatching the changes
 * to the Redux store.
 *
 * @param contact - The information for the new contact.
 */
export function addContact(contact: ContactNew): Contact {
  const id = uuid();

  const newContact = {
    id,
    address: contact.address,
    label: contact.label?.trim() || undefined,
    isName: contact.isName
  };

  // Save the contact to local storage
  saveContact(newContact);
  broadcastAddContact(newContact.id); // Broadcast changes to other tabs

  // Dispatch the changes to the Redux store
  store.dispatch(actions.addContact(newContact));

  return newContact;
}

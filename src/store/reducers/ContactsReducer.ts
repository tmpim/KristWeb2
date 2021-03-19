// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import * as actions from "@actions/ContactsActions";
import { createReducer } from "typesafe-actions";

import {
  Contact, ContactMap, loadContacts, CONTACT_UPDATABLE_KEYS
} from "@contacts";

export interface State {
  readonly contacts: ContactMap;
}

export function getInitialContactsState(): State {
  const contacts = loadContacts();
  return { contacts };
}

function assignNewContactProperties(
  state: State,
  id: string,
  partialContact: Partial<Contact>,
  allowedKeys?: (keyof Contact)[]
) {
  // Fetch the old contact and assign the new properties
  const { [id]: contact } = state.contacts;
  const newContact = allowedKeys
    ? allowedKeys.reduce((o, key) => partialContact[key] !== undefined
      ? { ...o, [key]: partialContact[key] }
      : o, {})
    : partialContact;

  return {
    ...state,
    contacts: {
      ...state.contacts,
      [id]: { ...contact, ...newContact }
    }
  };
}

export const ContactsReducer = createReducer({ contacts: {} } as State)
  // Load contacts
  .handleAction(actions.loadContacts, (state, { payload }) => ({
    ...state,
    contacts: {
      ...state.contacts,
      ...payload
    }
  }))
  // Add contact
  .handleAction(actions.addContact, (state, { payload }) => ({
    ...state,
    contacts: {
      ...state.contacts,
      [payload.id]: payload
    }
  }))
  // Remove contact
  .handleAction(actions.removeContact, (state, { payload }) => {
    // Get the contacts without the one we want to remove
    const { [payload]: _, ...contacts } = state.contacts;
    return { ...state, contacts };
  })
  // Update contact
  .handleAction(actions.updateContact, (state, { payload }) =>
    assignNewContactProperties(state, payload.id, payload.contact, CONTACT_UPDATABLE_KEYS));

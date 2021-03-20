// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";
import * as actions from "@actions/ContactsActions";

import { Contact, ContactNew, saveContact } from "..";
import { broadcastEditContact } from "@global/StorageBroadcast";

/**
 * Edits a contact, saving it to local storage, and dispatching the changes to
 * the Redux store.
 *
 * @param contact - The old contact information.
 * @param updated - The new contact information.
 */
export function editContact(
  contact: Contact,
  updated: ContactNew
): void {
  const finalContact = {
    ...contact,
    address: updated.address,
    label: updated.label?.trim() || "",
    isName: updated.isName
  };

  // Save the updated contact to local storage
  saveContact(finalContact);
  broadcastEditContact(contact.id); // Broadcast changes to other tabs

  // Dispatch the changes to the Redux store
  store.dispatch(actions.updateContact({ id: contact.id, contact: finalContact }));
}

/**
 * Edits just a contact's label. This can be set to an empty string to be
 * removed, or to `undefined` to use the existing value.
 *
 * @param contact - The old contact information.
 * @param label - The new contact label.
 */
export function editContactLabel(
  contact: Contact,
  label: string | "" | undefined
): void {
  const updatedLabel = label?.trim() === ""
    ? undefined
    : (label?.trim() || contact.label);

  const finalContact = {
    ...contact,
    label: updatedLabel
  };

  // Save the updated contact to local storage
  saveContact(finalContact);
  broadcastEditContact(contact.id); // Broadcast changes to other tabs

  // Dispatch the changes to the Redux store
  store.dispatch(actions.updateContact({ id: contact.id, contact: finalContact }));
}

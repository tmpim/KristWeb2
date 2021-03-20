// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
export interface Contact {
  // UUID for this contact
  id: string;

  address: string;
  label?: string;
  isName?: boolean;
}

export interface ContactMap { [key: string]: Contact }

/** Properties of Contact that are required to create a new contact. */
export type ContactNewKeys = "address" | "label" | "isName";
export type ContactNew = Pick<Contact, ContactNewKeys>;

/** Properties of Contact that are allowed to be updated. */
export type ContactUpdatableKeys = "address" | "label" | "isName";
export const CONTACT_UPDATABLE_KEYS: ContactUpdatableKeys[]
  = ["address", "label", "isName"];
export type ContactUpdatable = Pick<Contact, ContactUpdatableKeys>;

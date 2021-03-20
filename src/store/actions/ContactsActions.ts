// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createAction } from "typesafe-actions";

import * as constants from "../constants";

import { Contact, ContactMap, ContactUpdatable } from "@contacts";

export const loadContacts = createAction(constants.LOAD_CONTACTS)<ContactMap>();
export const addContact = createAction(constants.ADD_CONTACT)<Contact>();
export const removeContact = createAction(constants.REMOVE_CONTACT)<string>();

export interface UpdateContactPayload { id: string; contact: ContactUpdatable }
export const updateContact = createAction(constants.UPDATE_CONTACT)<UpdateContactPayload>();

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { store } from "@app";
import * as actions from "@actions/WalletsActions";
import * as contactActions from "@actions/ContactsActions";

import { getWalletKey, parseWallet, syncWallet } from "@wallets";
import { getContactKey, parseContact } from "@contacts";

import Debug from "debug";
const debug = Debug("kristweb:storage-broadcast");

export const channel = new BroadcastChannel("kristweb:storage");

export function broadcastAddWallet(id: string): void {
  debug("broadcasting addWallet event for wallet id %s", id);
  channel.postMessage(["addWallet", id]);
}

export function broadcastEditWallet(id: string): void {
  debug("broadcasting editWallet event for wallet id %s", id);
  channel.postMessage(["editWallet", id]);
}

export function broadcastDeleteWallet(id: string): void {
  debug("broadcasting deleteWallet event for wallet id %s", id);
  channel.postMessage(["deleteWallet", id]);
}

export function broadcastAddContact(id: string): void {
  debug("broadcasting deleteContact event for contact id %s", id);
  channel.postMessage(["deleteContact", id]);
}

export function broadcastEditContact(id: string): void {
  debug("broadcasting editContact event for contact id %s", id);
  channel.postMessage(["editContact", id]);
}

export function broadcastDeleteContact(id: string): void {
  debug("broadcasting deleteContact event for contact id %s", id);
  channel.postMessage(["deleteContact", id]);
}

/** Component that manages a BroadcastChannel responsible for dispatching wallet
 * storage events (add, edit, delete) across tabs. */
export function StorageBroadcast(): JSX.Element | null {
  // TODO: is it safe to register this here?
  debug("registering storage broadcast event listener");
  channel.onmessage = e => {
    debug("received storage broadcast:", e);

    if (Array.isArray(e.data)) {
      const [type, ...data] = e.data;

      if (type === "addWallet" || type === "editWallet") {
        // ---------------------------------------------------------------------
        // addWallet, editWallet
        // ---------------------------------------------------------------------
        const id: string = data[0];
        const key = getWalletKey(id);

        // Load the wallet from localStorage (the update should've been
        // synchronous)
        const wallet = parseWallet(id, localStorage.getItem(key));
        debug("%s broadcast %s", type, id);

        // Dispatch the new/updated wallet to the Redux store
        if (type === "addWallet") store.dispatch(actions.addWallet(wallet));
        else store.dispatch(actions.updateWallet(id, wallet));

        syncWallet(wallet, true);
      } else if (type === "deleteWallet") {
        // ---------------------------------------------------------------------
        // deleteWallet
        // ---------------------------------------------------------------------
        const id: string = data[0];
        debug("addWallet broadcast %s", id);
        store.dispatch(actions.removeWallet(id));
      } else if (type === "addContact" || type === "editContact") {
        // ---------------------------------------------------------------------
        // addContact, editContact
        // ---------------------------------------------------------------------
        const id: string = data[0];
        const key = getContactKey(id);

        // Load the contact from localStorage (the update should've been
        // synchronous)
        const contact = parseContact(id, localStorage.getItem(key));
        debug("%s broadcast %s", type, id);

        // Dispatch the new/updated contact to the Redux store
        if (type === "addContact") store.dispatch(contactActions.addContact(contact));
        else store.dispatch(contactActions.updateContact({ id, contact }));
      } else if (type === "deleteContact") {
        // ---------------------------------------------------------------------
        // deleteContact
        // ---------------------------------------------------------------------
        const id: string = data[0];
        debug("deleteContact broadcast %s", id);
        store.dispatch(contactActions.removeContact(id));
      } else {
        debug("received unknown broadcast msg type %s", type);
      }
    }
  };

  return null;
}

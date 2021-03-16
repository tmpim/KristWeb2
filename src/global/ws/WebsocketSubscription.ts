// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useContext, useState, useEffect } from "react";
import { v4 as uuid } from "uuid";

import { useSelector } from "react-redux";
import { RootState } from "@store";
import * as actions from "@actions/WebsocketActions";

import { WebsocketContext } from "./WebsocketProvider";

import Debug from "debug";
const debug = Debug("kristweb:websocket-subscription");

export interface WSSubscription {
  address?: string;
  name?: string;
  lastTransactionID: number;
}

export function createSubscription(address?: string, name?: string): [string, WSSubscription] {
  const id = uuid();

  // It's okay to initialise at 0, since it will still render appropriately;
  // it will be updated whenever a relevant transaction comes in
  const subscription = {
    address, name, lastTransactionID: 0
  };

  // Dispatch the new subscription to the Redux store
  actions.initSubscription(id, subscription);

  return [id, subscription];
}

export function removeSubscription(id: string): void {
  // Dispatch the changes subscription to the Redux store
  actions.removeSubscription(id);
}

/** Creates a subscription to an address or name's last transaction ID.
 * Will return 0 unless a transaction was detected after the subscription was
 * created. */
export function useSubscription({ address, name }: { address?: string; name?: string }): number {
  const { connection } = useContext(WebsocketContext);
  const [subscriptionID, setSubscriptionID] = useState<string>();

  // Don't select anything if there's no address or name anymore
  const selector = address || name ? (subscriptionID || "") : "";
  const storeSubscription = useSelector((s: RootState) => s.websocket.subscriptions[selector]);

  // Create the subscription on mount if we don't have one
  useEffect(() => {
    if (!connection && subscriptionID) {
      debug("connection lost, wiping subscription ID");
      removeSubscription(subscriptionID);
      setSubscriptionID(undefined);
      return;
    } else if (!connection || subscriptionID) return;

    // This hook may still get called if there's nothing the caller wants to
    // subscribe to, so stop here if that's the case
    if (!address && !name) return;

    debug("ws subscription has no id yet, registering one");
    const [id, subscription] = createSubscription(address, name);
    connection.addSubscription(id, subscription);
    setSubscriptionID(id);
    debug("new subscription id is %s", id);
  }, [connection, subscriptionID, address, name]);

  // If the address or name change, wipe the subscription ID
  useEffect(() => {
    if (subscriptionID) {
      debug("address or name changed, wiping subscription");
      if (connection) connection.removeSubscription(subscriptionID);
      removeSubscription(subscriptionID);
      setSubscriptionID(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, name]);

  // Unsubscribe when unmounted
  useEffect(() => {
    return () => {
      if (!subscriptionID) return;
      debug("ws subscription %s being removed due to unmount", subscriptionID);

      if (connection) connection.removeSubscription(subscriptionID);
      removeSubscription(subscriptionID);
    };
  }, [connection, subscriptionID]);

  if (!connection) {
    debug("ws subscription returning 0 because no connection yet");
    return 0;
  }

  const out = storeSubscription
    ? storeSubscription.lastTransactionID
    : 0;

  // debug("ws subscription %s is %d", subscriptionID, out);
  return out;
}

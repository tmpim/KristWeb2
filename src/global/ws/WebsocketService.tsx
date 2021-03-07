// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect, useContext } from "react";

import { WebsocketContext } from "./WebsocketProvider";
import { WebsocketConnection } from "./WebsocketConnection";

import * as api from "@api";
import { useWallets } from "@wallets";

import Debug from "debug";
const debug = Debug("kristweb:websocket-service");

export function WebsocketService(): JSX.Element | null {
  const { wallets } = useWallets();
  const syncNode = api.useSyncNode();

  const { connection, setConnection } = useContext(WebsocketContext);

  // On first render, or if the sync node changes, create the websocket
  // connection
  useEffect(() => {
    // Don't reconnect if we already have a connection and the sync node hasn't
    // changed (prevents infinite loops)
    if (connection && connection.syncNode === syncNode) return;

    // Close any existing connections
    if (connection) connection.forceClose();

    if (!setConnection) {
      debug("ws provider setConnection is missing!");
      return;
    }

    // Connect to the Krist websocket server
    setConnection(new WebsocketConnection(syncNode));

    // On unmount, force close the existing connection
    return () => {
      if (connection) connection.forceClose();
    };
  }, [syncNode, connection, setConnection]);

  // If the wallets change, let the websocket service know so that it can keep
  // track of events related to any new wallets
  useEffect(() => {
    if (connection) connection.setWallets(wallets);
  }, [wallets, connection]);

  return null;
}

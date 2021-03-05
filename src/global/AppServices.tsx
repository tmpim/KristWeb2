// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";

import { SyncWallets } from "@comp/wallets/SyncWallets";
import { ForcedAuth } from "@comp/auth/ForcedAuth";
import { WebsocketService } from "./ws/WebsocketService";
import { SyncWork } from "./ws/SyncWork";
import { SyncMOTD } from "./ws/SyncMOTD";

export function AppServices(): JSX.Element {
  return <>
    <SyncWallets />
    <SyncWork />
    <SyncMOTD />
    <ForcedAuth />
    <WebsocketService />
  </>;
}

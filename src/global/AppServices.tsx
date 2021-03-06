// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt

import { SyncWallets } from "@comp/wallets/SyncWallets";
import { ForcedAuth } from "./ForcedAuth";
import { WebsocketService } from "./ws/WebsocketService";
import { SyncMOTD } from "./ws/SyncMOTD";
import { AppHotkeys } from "./AppHotkeys";
import { StorageBroadcast } from "./StorageBroadcast";

export function AppServices(): JSX.Element {
  return <>
    <SyncWallets />
    <SyncMOTD />
    <ForcedAuth />
    <WebsocketService />
    <AppHotkeys />
    <StorageBroadcast />
  </>;
}

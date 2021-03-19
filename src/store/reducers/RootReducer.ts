// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { combineReducers } from "redux";

import { MasterPasswordReducer } from "./MasterPasswordReducer";
import { WalletsReducer } from "./WalletsReducer";
import { ContactsReducer } from "./ContactsReducer";
import { SettingsReducer } from "./SettingsReducer";
import { WebsocketReducer } from "./WebsocketReducer";
import { NodeReducer } from "./NodeReducer";
import { MiscReducer } from "./MiscReducer";

export default combineReducers({
  masterPassword: MasterPasswordReducer,
  wallets: WalletsReducer,
  contacts: ContactsReducer,
  settings: SettingsReducer,
  websocket: WebsocketReducer,
  node: NodeReducer,
  misc: MiscReducer
});

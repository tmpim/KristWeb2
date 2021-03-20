// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { getInitialMasterPasswordState } from "./reducers/MasterPasswordReducer";
import { getInitialWalletsState } from "./reducers/WalletsReducer";
import { getInitialContactsState } from "./reducers/ContactsReducer";
import { getInitialSettingsState } from "./reducers/SettingsReducer";
import { getInitialNodeState } from "./reducers/NodeReducer";

import { createStore, Store } from "redux";
import { devToolsEnhancer } from "redux-devtools-extension";
import rootReducer from "./reducers/RootReducer";

import { RootState, RootAction } from "./index";

export const initStore = (): Store<RootState, RootAction> => createStore(
  rootReducer,
  {
    masterPassword: getInitialMasterPasswordState(),
    wallets: getInitialWalletsState(),
    contacts: getInitialContactsState(),
    settings: getInitialSettingsState(),
    node: getInitialNodeState()
  },
  devToolsEnhancer({})
);

import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { createStore } from "redux";
import { Provider } from "react-redux";
import { devToolsEnhancer } from "redux-devtools-extension";
import rootReducer from "./store/reducers/RootReducer";

import { getInitialWalletManagerState } from "./store/reducers/WalletManagerReducer";
import { getInitialWalletsState } from "./store/reducers/WalletsReducer";
import { getInitialSettingsState } from "./store/reducers/SettingsReducer";

// Set up localisation
import "./utils/i18n";

import "./App.less";
import { AppLayout } from "./layout/AppLayout";
import { SyncWallets } from "./components/wallets/SyncWallets";
import { ForcedAuth } from "./components/auth/ForcedAuth";
import { WebsocketService } from "./components/ws/WebsocketService";
import { SyncWork } from "./components/ws/SyncWork";

export const store = createStore(
  rootReducer,
  {
    walletManager: getInitialWalletManagerState(),
    wallets: getInitialWalletsState(),
    settings: getInitialSettingsState()
  },
  devToolsEnhancer({})
);
export type AppDispatch = typeof store.dispatch;

function App(): JSX.Element {
  return <Suspense fallback="Loading (TODO)"> {/* TODO */}
    <Provider store={store}>
      <Router>
        <AppLayout />

        {/* Services, etc. */}
        <SyncWallets />
        <SyncWork />
        <ForcedAuth />
        <WebsocketService />
      </Router>
    </Provider>
  </Suspense>;
}

export default App;

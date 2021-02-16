import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { createStore } from "redux";
import { Provider } from "react-redux";
import { devToolsEnhancer } from "redux-devtools-extension";
import rootReducer from "./store/reducers/RootReducer";

import { getInitialWalletManagerState } from "./store/reducers/WalletManagerReducer";
import { getInitialSettingsState } from "./store/reducers/SettingsReducer";

// Set up localisation
import "./utils/i18n";

import "./App.less";
import { AppLayout } from "./layout/AppLayout";
import { ForcedAuth } from "./components/auth/ForcedAuth";

export const store = createStore(
  rootReducer,
  {
    walletManager: getInitialWalletManagerState(),
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
        <ForcedAuth />
      </Router>
    </Provider>
  </Suspense>;
}

export default App;

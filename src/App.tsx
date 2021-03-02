// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { Provider } from "react-redux";
import { initStore } from "./store/init";

import { HotKeys } from "react-hotkeys";
import { keyMap } from "./global/AppHotkeys";

// Set up localisation
import "./utils/i18n";

// FIXME: Apparently the import order of my CSS is important. Who knew!
import "./App.less";

import { AppLoading } from "./global/AppLoading";
import { CheckStatus } from "./pages/CheckStatus";
import { AppServices } from "./global/AppServices";

import Debug from "debug";
const debug = Debug("kristweb:app");

export const store = initStore();
export type AppDispatch = typeof store.dispatch;

function App(): JSX.Element {
  debug("whole app is being rendered!");

  return <Suspense fallback={<AppLoading />}>
    <Provider store={store}>
      <HotKeys keyMap={keyMap}>
        <Router>
          <CheckStatus />

          {/* Services, etc. */}
          <AppServices />
        </Router>
      </HotKeys>
    </Provider>
  </Suspense>;
}

export default App;

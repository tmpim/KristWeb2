import React, { Suspense } from "react";

import { MainLayout } from "../layouts/main/MainLayout";

import { MasterPasswordDialog } from "@layouts/dialogs/MasterPasswordDialog";

// import { kristService } from "@krist/KristConnectionService";

import { createStore } from "redux";
import { Provider } from "react-redux";
import { devToolsEnhancer } from 'redux-devtools-extension';
import rootReducer from "@/src/store/reducers/RootReducer";

export const store = createStore(
  rootReducer, 
  undefined,
  devToolsEnhancer({})
);
export type AppDispatch = typeof store.dispatch;

/*import packageJson from "@/package.json";

kristService().connect(packageJson.defaultSyncNode) // TODO
  .catch(console.error);*/
  
export const App: React.FC = () => (
  <Suspense fallback="Loading (TODO)"> {/* TODO */}
    <Provider store={store}>
      <MainLayout />
      <MasterPasswordDialog />
    </Provider>
  </Suspense>
);

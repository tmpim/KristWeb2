import React from "react";
import "./App.scss";

import { MainLayout } from "../layouts/main";

import { MasterPasswordDialog } from "@layouts/dialogs/MasterPasswordDialog";

// import { kristService } from "@krist/KristConnectionService";

import { createStore } from "redux";
import { Provider } from "react-redux";
import rootReducer from "@/src/store/reducers/RootReducer";

export const store = createStore(rootReducer);
export type AppDispatch = typeof store.dispatch;

/*import packageJson from "@/package.json";

kristService().connect(packageJson.defaultSyncNode) // TODO
  .catch(console.error);*/
  
export const App: React.FC = () => (
  <Provider store={store}>
    <MainLayout />
    <MasterPasswordDialog />
  </Provider>
);

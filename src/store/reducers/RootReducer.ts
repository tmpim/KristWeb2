import { combineReducers } from "redux";

import { WalletManagerReducer } from "./WalletManagerReducer";
import { WalletsReducer } from "./WalletsReducer";
import { SettingsReducer } from "./SettingsReducer";
import { WebsocketReducer } from "./WebsocketReducer";

export default combineReducers({
  walletManager: WalletManagerReducer,
  wallets: WalletsReducer,
  settings: SettingsReducer,
  websocket: WebsocketReducer
});

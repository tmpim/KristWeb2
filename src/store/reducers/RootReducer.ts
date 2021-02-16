import { combineReducers } from "redux";

import { WalletManagerReducer } from "./WalletManagerReducer";
import { WalletsReducer } from "./WalletsReducer";
import { SettingsReducer } from "./SettingsReducer";

export default combineReducers({
  walletManager: WalletManagerReducer,
  wallets: WalletsReducer,
  settings: SettingsReducer,
});

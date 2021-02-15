import { combineReducers } from "redux";

import { WalletManagerReducer } from "./WalletManagerReducer";
import { WalletsReducer } from "./WalletsReducer";

export default combineReducers({
  walletManager: WalletManagerReducer,
  wallets: WalletsReducer
});

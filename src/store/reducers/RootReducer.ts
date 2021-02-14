import { combineReducers } from "redux";

import { WalletManagerReducer } from "./WalletManagerReducer";

export default combineReducers({
  walletManager: WalletManagerReducer
});

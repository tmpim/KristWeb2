import { combineReducers } from "redux";
import { WalletManagerReducer } from "@reducers/WalletManagerReducer";

export default combineReducers({
  walletManager: WalletManagerReducer
});

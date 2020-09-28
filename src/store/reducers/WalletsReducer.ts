import { loadWallets } from "@actions/WalletsActions";
import { createReducer, ActionType } from "typesafe-actions";

import { Wallet } from "../../wallets/Wallet";

export type WalletMap = { [key: string]: Wallet };
export interface State {
  readonly wallets: WalletMap;
}

const initialState: State = {
  wallets: {}
};

export const WalletsReducer = createReducer(initialState)
  .handleAction(loadWallets, (state: State, action: ActionType<typeof loadWallets>) => ({
    wallets: {
      ...state.wallets,
      ...action.payload.wallets
    }
  }));

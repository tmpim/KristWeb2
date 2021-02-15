import { addWallet, loadWallets, removeWallet, syncWallet, updateWallet } from "../actions/WalletsActions";
import { createReducer, ActionType } from "typesafe-actions";

import { Wallet } from "../../krist/wallets/Wallet";

export interface WalletMap { [key: string]: Wallet }
export interface State {
  readonly wallets: WalletMap;
}

const initialState: State = {
  wallets: {}
};

function assignNewWalletProperties(state: State, id: string, partialWallet: Partial<Wallet>) {
  // Fetch the old wallet and assign the new properties
  const { [id]: wallet } = state.wallets;
  const newWallet = { ...wallet, ...partialWallet };
  return {
    ...state,
    wallets: {
      ...state.wallets,
      [id]: newWallet
    }
  };
}

export const WalletsReducer = createReducer(initialState)
  // Load wallets
  .handleAction(loadWallets, (state: State, { payload }: ActionType<typeof loadWallets>) => ({
    ...state,
    wallets: {
      ...state.wallets,
      ...payload.wallets
    }
  }))
  // Add wallet
  .handleAction(addWallet, (state: State, { payload }: ActionType<typeof addWallet>) => ({
    ...state,
    wallets: {
      ...state.wallets,
      [payload.wallet.id]: payload.wallet
    }
  }))
  // Remove wallet
  .handleAction(removeWallet, (state: State, { payload }: ActionType<typeof removeWallet>) => {
    // Get the wallets without the one we want to remove
    const { [payload.id]: _, ...wallets } = state.wallets;
    return { ...state, wallets };
  })
  // Update wallet
  .handleAction(updateWallet, (state: State, { payload }: ActionType<typeof updateWallet>) =>
    assignNewWalletProperties(state, payload.id, payload.wallet))
  // Sync wallet
  .handleAction(syncWallet, (state: State, { payload }: ActionType<typeof syncWallet>) =>
    assignNewWalletProperties(state, payload.id, payload.wallet));

import * as actions from "../actions/WalletsActions";
import { createReducer, ActionType } from "typesafe-actions";

import { Wallet, loadWallets, WALLET_UPDATABLE_KEYS, WALLET_SYNCABLE_KEYS } from "../../krist/wallets/Wallet";

export interface WalletMap { [key: string]: Wallet }
export interface State {
  readonly wallets: WalletMap;
}

export function getInitialWalletsState(): State {
  const wallets = loadWallets();
  return { wallets };
}

function assignNewWalletProperties(state: State, id: string, partialWallet: Partial<Wallet>, allowedKeys?: (keyof Wallet)[]) {
  // Fetch the old wallet and assign the new properties
  const { [id]: wallet } = state.wallets;
  const newWallet = allowedKeys
    ? allowedKeys.reduce((o, key) => partialWallet[key] !== undefined
      ? { ...o, [key]: partialWallet[key] }
      : o, {})
    : partialWallet;

  return {
    ...state,
    wallets: {
      ...state.wallets,
      [id]: { ...wallet, ...newWallet }
    }
  };
}

export const WalletsReducer = createReducer({ wallets: {} } as State)
  // Load wallets
  .handleAction(actions.loadWallets, (state: State, { payload }: ActionType<typeof actions.loadWallets>) => ({
    ...state,
    wallets: {
      ...state.wallets,
      ...payload.wallets
    }
  }))
  // Add wallet
  .handleAction(actions.addWallet, (state: State, { payload }: ActionType<typeof actions.addWallet>) => ({
    ...state,
    wallets: {
      ...state.wallets,
      [payload.wallet.id]: payload.wallet
    }
  }))
  // Remove wallet
  .handleAction(actions.removeWallet, (state: State, { payload }: ActionType<typeof actions.removeWallet>) => {
    // Get the wallets without the one we want to remove
    const { [payload.id]: _, ...wallets } = state.wallets;
    return { ...state, wallets };
  })
  // Update wallet
  .handleAction(actions.updateWallet, (state: State, { payload }: ActionType<typeof actions.updateWallet>) =>
    assignNewWalletProperties(state, payload.id, payload.wallet, WALLET_UPDATABLE_KEYS))
  // Sync wallet
  .handleAction(actions.syncWallet, (state: State, { payload }: ActionType<typeof actions.syncWallet>) =>
    assignNewWalletProperties(state, payload.id, payload.wallet, WALLET_SYNCABLE_KEYS))
  // Sync wallets
  .handleAction(actions.syncWallets, (state: State, { payload }: ActionType<typeof actions.syncWallets>) => {
    const updatedWallets = Object.entries(payload.wallets)
      .map(([id, newData]) => ({ // merge in the new data
        ...(state.wallets[id]), // old data

        // only pull the relevant keys, in case this is a full Wallet object
        balance: newData.balance,
        names: newData.names,
        firstSeen: newData.firstSeen,
        lastSynced: newData.lastSynced
      })) // convert back to a WalletMap
      .reduce((o, wallet) => ({ ...o, [wallet.id]: wallet }), {});

    return { ...state, wallets: { ...state.wallets, ...updatedWallets }};
  })
  // Recalculate wallets
  .handleAction(actions.recalculateWallets, (state: State, { payload }: ActionType<typeof actions.recalculateWallets>) => {
    const updatedWallets = Object.entries(payload.wallets)
      .map(([id, newData]) => ({ // merge in the new data
        ...(state.wallets[id]), // old data
        address: newData // recalculated address
      })) // convert back to a WalletMap
      .reduce((o, wallet) => ({ ...o, [wallet.id]: wallet }), {});

    return { ...state, wallets: { ...state.wallets, ...updatedWallets }};
  });


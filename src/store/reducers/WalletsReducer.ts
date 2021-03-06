// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import * as actions from "@actions/WalletsActions";
import { createReducer, ActionType } from "typesafe-actions";

import { Wallet, WalletMap, loadWallets, WALLET_UPDATABLE_KEYS, WALLET_SYNCABLE_KEYS } from "@wallets";

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
  .handleAction(actions.loadWallets, (state, { payload }) => ({
    ...state,
    wallets: {
      ...state.wallets,
      ...payload.wallets
    }
  }))
  // Add wallet
  .handleAction(actions.addWallet, (state, { payload }) => ({
    ...state,
    wallets: {
      ...state.wallets,
      [payload.wallet.id]: payload.wallet
    }
  }))
  // Remove wallet
  .handleAction(actions.removeWallet, (state, { payload }) => {
    // Get the wallets without the one we want to remove
    const { [payload.id]: _, ...wallets } = state.wallets;
    return { ...state, wallets };
  })
  // Update wallet
  .handleAction(actions.updateWallet, (state, { payload }) =>
    assignNewWalletProperties(state, payload.id, payload.wallet, WALLET_UPDATABLE_KEYS))
  // Sync wallet
  .handleAction(actions.syncWallet, (state, { payload }) =>
    assignNewWalletProperties(state, payload.id, payload.wallet, WALLET_SYNCABLE_KEYS))
  // Sync wallets
  .handleAction(actions.syncWallets, (state, { payload }) => {
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
  // Unsync wallet (remove its balance etc. as it no longer exists)
  .handleAction(actions.unsyncWallet, (state, { payload }) => ({
    ...state,
    wallets: {
      ...state.wallets,
      [payload.id]: {
        ...state.wallets[payload.id],
        balance: undefined,
        names: undefined,
        firstSeen: undefined,
        lastSynced: payload.lastSynced
      }
    }
  }))
  // Recalculate wallets
  .handleAction(actions.recalculateWallets, (state, { payload }) => {
    const updatedWallets = Object.entries(payload.wallets)
      .map(([id, newData]) => ({ // merge in the new data
        ...(state.wallets[id]), // old data
        address: newData // recalculated address
      })) // convert back to a WalletMap
      .reduce((o, wallet) => ({ ...o, [wallet.id]: wallet }), {});

    return { ...state, wallets: { ...state.wallets, ...updatedWallets }};
  });


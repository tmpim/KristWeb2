import { createAction } from "typesafe-actions";

import * as constants from "../constants";

import { WalletMap } from "../reducers/WalletsReducer";
import { Wallet, WalletSyncable, WalletUpdatable } from "../../krist/wallets/Wallet";

export interface LoadWalletsPayload { wallets: WalletMap };
export const loadWallets = createAction(constants.LOAD_WALLETS,
  (wallets): LoadWalletsPayload => ({ wallets }))<LoadWalletsPayload>();

export interface AddWalletPayload { wallet: Wallet };
export const addWallet = createAction(constants.ADD_WALLET,
  (wallet): AddWalletPayload => ({ wallet }))<AddWalletPayload>();

export interface RemoveWalletPayload { id: string };
export const removeWallet = createAction(constants.REMOVE_WALLET,
  (id): RemoveWalletPayload => ({ id }))<RemoveWalletPayload>();

export interface UpdateWalletPayload { id: string; wallet: WalletUpdatable };
export const updateWallet = createAction(constants.UPDATE_WALLET,
  (id, wallet): UpdateWalletPayload => ({ id, wallet }))<UpdateWalletPayload>();

export interface SyncWalletPayload { id: string; wallet: WalletSyncable };
export const syncWallet = createAction(constants.SYNC_WALLET,
  (id, wallet): SyncWalletPayload => ({ id, wallet }))<SyncWalletPayload>();

export interface SyncWalletsPayload { wallets: Record<string, WalletSyncable> };
export const syncWallets = createAction(constants.SYNC_WALLETS,
  (wallets): SyncWalletsPayload => ({ wallets }))<SyncWalletsPayload>();

export interface RecalculateWalletsPayload { wallets: Record<string, string> };
export const recalculateWallets = createAction(constants.RECALCULATE_WALLETS,
  (wallets): RecalculateWalletsPayload => ({ wallets }))<RecalculateWalletsPayload>();

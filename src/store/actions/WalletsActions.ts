/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createAction } from "typesafe-actions";

import * as constants from "../constants";

import { WalletMap } from "@reducers/WalletsReducer";

export interface LoadWalletsPayload { wallets: WalletMap };
export const loadWallets = createAction(constants.LOAD_WALLETS,
  (wallets: WalletMap): LoadWalletsPayload => ({ wallets }))<LoadWalletsPayload>();

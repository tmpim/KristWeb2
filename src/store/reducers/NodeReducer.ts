// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createReducer, ActionType } from "typesafe-actions";
import { KristWorkDetailed, KristCurrency, DEFAULT_CURRENCY, KristConstants, DEFAULT_CONSTANTS, KristMOTDBase, DEFAULT_MOTD_BASE } from "../../krist/api/types";
import { setSyncNode, setLastBlockID, setDetailedWork, setCurrency, setConstants, setMOTD } from "../actions/NodeActions";

import packageJson from "../../../package.json";

export interface State {
  readonly lastBlockID: number;
  readonly detailedWork?: KristWorkDetailed;
  readonly syncNode: string;
  readonly currency: KristCurrency;
  readonly constants: KristConstants;
  readonly motd: KristMOTDBase;
}

export function getInitialNodeState(): State {
  return {
    lastBlockID: 0,
    syncNode: localStorage.getItem("syncNode") || packageJson.defaultSyncNode,
    currency: DEFAULT_CURRENCY,
    constants: DEFAULT_CONSTANTS,
    motd: DEFAULT_MOTD_BASE
  };
}

export const NodeReducer = createReducer({} as State)
  .handleAction(setSyncNode, (state: State, action: ActionType<typeof setSyncNode>) => ({
    ...state,
    syncNode: action.payload
  }))
  .handleAction(setLastBlockID, (state: State, action: ActionType<typeof setLastBlockID>) => ({
    ...state,
    lastBlockID: action.payload
  }))
  .handleAction(setDetailedWork, (state: State, action: ActionType<typeof setDetailedWork>) => ({
    ...state,
    detailedWork: action.payload
  }))
  .handleAction(setCurrency, (state: State, action: ActionType<typeof setCurrency>) => ({
    ...state,
    currency: action.payload
  }))
  .handleAction(setConstants, (state: State, action: ActionType<typeof setConstants>) => ({
    ...state,
    constants: action.payload
  }))
  .handleAction(setMOTD, (state: State, action: ActionType<typeof setMOTD>) => ({
    ...state,
    motd: action.payload
  }));

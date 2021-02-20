import { createReducer, ActionType } from "typesafe-actions";
import { KristWorkDetailed } from "../../krist/api/types";
import { setLastBlockID, setDetailedWork } from "../actions/NodeActions";

export interface State {
  readonly lastBlockID: number;
  readonly detailedWork?: KristWorkDetailed;
}

export const initialState: State = {
  lastBlockID: 0
};

export const NodeReducer = createReducer(initialState)
  .handleAction(setLastBlockID, (state: State, action: ActionType<typeof setLastBlockID>) => ({
    ...state,
    lastBlockID: action.payload
  }))
  .handleAction(setDetailedWork, (state: State, action: ActionType<typeof setDetailedWork>) => ({
    ...state,
    detailedWork: action.payload
  }));


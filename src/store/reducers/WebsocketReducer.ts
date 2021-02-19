import { createReducer, ActionType } from "typesafe-actions";
import { WSConnectionState } from "../../krist/api/types";
import { setConnectionState } from "../actions/WebsocketActions";

export interface State {
  readonly connectionState: WSConnectionState;
}

export const initialState: State = {
  connectionState: "disconnected"
};

export const WebsocketReducer = createReducer(initialState)
  .handleAction(setConnectionState, (state: State, action: ActionType<typeof setConnectionState>) => ({
    ...state,
    connectionState: action.payload
  }));

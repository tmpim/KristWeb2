// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createReducer, ActionType } from "typesafe-actions";
import { WSConnectionState } from "@api/types";
import { setConnectionState } from "@actions/WebsocketActions";

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

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createReducer } from "typesafe-actions";
import { WSConnectionState } from "@api/types";
import * as actions from "@actions/WebsocketActions";

import { WSSubscription } from "@global/ws/WebsocketSubscription";

export interface State {
  readonly connectionState: WSConnectionState;
  readonly subscriptions: Record<string, WSSubscription>;
}

export const initialState: State = {
  connectionState: "disconnected",
  subscriptions: {}
};

export const WebsocketReducer = createReducer(initialState)
  // Set websocket connection state
  .handleAction(actions.setConnectionState, (state, { payload }) => ({
    ...state,
    connectionState: payload
  }))
  // Initialise websocket subscription
  .handleAction(actions.initSubscription, (state, { payload }) => ({
    ...state,
    subscriptions: {
      ...state.subscriptions,
      [payload.id]: payload.subscription
    }
  }))
  // Update websocket subscription
  .handleAction(actions.updateSubscription, (state, { payload }) => ({
    ...state,
    subscriptions: {
      ...state.subscriptions,
      [payload.id]: {
        ...state.subscriptions[payload.id],
        lastTransactionID: payload.lastTransactionID
      }
    }
  }))
  // Remove websocket subscription
  .handleAction(actions.removeSubscription, (state, { payload }) => {
    // Get the subscriptions without the one we want to remove
    const { [payload]: _, ...subscriptions } = state.subscriptions;
    return { ...state, subscriptions };
  });

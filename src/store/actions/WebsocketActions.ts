// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createAction } from "typesafe-actions";
import { WSConnectionState } from "@api/types";

import { WSSubscription } from "@global/ws/WebsocketSubscription";

import * as constants from "../constants";

export const setConnectionState = createAction(constants.CONNECTION_STATE)<WSConnectionState>();

export interface InitSubscriptionPayload { id: string; subscription: WSSubscription }
export const initSubscription = createAction(constants.INIT_SUBSCRIPTION,
  (id, subscription): InitSubscriptionPayload =>
    ({ id, subscription }))<InitSubscriptionPayload>();

export interface UpdateSubscriptionPayload { id: string; lastTransactionID: number }
export const updateSubscription = createAction(constants.UPDATE_SUBSCRIPTION,
  (id, lastTransactionID): UpdateSubscriptionPayload =>
    ({ id, lastTransactionID }))<UpdateSubscriptionPayload>();

export const removeSubscription = createAction(constants.REMOVE_SUBSCRIPTION)<string>();

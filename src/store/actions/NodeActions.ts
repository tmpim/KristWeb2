// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createAction } from "typesafe-actions";
import { KristWorkDetailed, KristCurrency, KristConstants, KristMOTDBase } from "@api/types";

import * as constants from "../constants";

export const setLastBlockID = createAction(constants.LAST_BLOCK_ID)<number>();
export const setLastTransactionID = createAction(constants.LAST_TRANSACTION_ID)<number>();
export const setLastNonMinedTransactionID = createAction(constants.LAST_NON_MINED_TRANSACTION_ID)<number>();
export const setLastOwnTransactionID = createAction(constants.LAST_OWN_TRANSACTION_ID)<number>();
export const setLastNameTransactionID = createAction(constants.LAST_NAME_TRANSACTION_ID)<number>();
export const setLastOwnNameTransactionID = createAction(constants.LAST_OWN_NAME_TRANSACTION_ID)<number>();

export const setSyncNode = createAction(constants.SYNC_NODE)<string>();
export const setDetailedWork = createAction(constants.DETAILED_WORK)<KristWorkDetailed>();
export const setCurrency = createAction(constants.CURRENCY)<KristCurrency>();
export const setConstants = createAction(constants.CONSTANTS)<KristConstants>();
export const setMOTD = createAction(constants.MOTD)<KristMOTDBase>();

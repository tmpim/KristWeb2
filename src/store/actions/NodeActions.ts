import { createAction } from "typesafe-actions";
import { KristWorkDetailed, KristCurrency } from "../../krist/api/types";

import * as constants from "../constants";

export const setSyncNode = createAction(constants.SYNC_NODE)<string>();
export const setLastBlockID = createAction(constants.LAST_BLOCK_ID)<number>();
export const setDetailedWork = createAction(constants.DETAILED_WORK)<KristWorkDetailed>();
export const setCurrency = createAction(constants.DETAILED_WORK)<KristCurrency>();

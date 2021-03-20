// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createAction } from "typesafe-actions";
import * as constants from "../constants";

export const incrementNameTableLock = createAction(constants.INCR_NAME_TABLE_LOCK)();
export const decrementNameTableLock = createAction(constants.DECR_NAME_TABLE_LOCK)();

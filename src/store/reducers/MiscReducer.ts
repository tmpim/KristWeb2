// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { createReducer } from "typesafe-actions";
import {
  incrementNameTableLock, decrementNameTableLock
} from "@actions/MiscActions";

export interface State {
  readonly nameTableLock: number;
}

const initialState: State = {
  nameTableLock: 0
};

export const MiscReducer = createReducer(initialState)
  .handleAction(incrementNameTableLock, (state, _) => ({
    ...state,
    nameTableLock: state.nameTableLock + 1
  }))
  .handleAction(decrementNameTableLock, (state, _) => ({
    ...state,
    nameTableLock: state.nameTableLock - 1
  }));

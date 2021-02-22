// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { ActionType, StateType } from "typesafe-actions";

export type Store = StateType<typeof import("../App").store>;
export type RootAction = ActionType<typeof import("./actions/index").default>;
export type RootState = StateType<typeof import("./reducers/RootReducer").default>;

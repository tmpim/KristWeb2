import { ActionType, StateType } from "typesafe-actions";

export type Store = StateType<typeof import("../App").store>;
export type RootAction = ActionType<typeof import("./actions/index").default>;
export type RootState = StateType<ReturnType<typeof import("./reducers/RootReducer").default>>;

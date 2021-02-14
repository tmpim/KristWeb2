import { Store, RootAction, RootState } from "./";

declare module "typesafe-actions" {
  interface Types {
    Store: Store;
    RootAction: RootAction;
    RootState: RootState;
  }
}

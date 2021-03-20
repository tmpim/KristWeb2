// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Store, RootAction, RootState } from "./";

declare module "typesafe-actions" {
  interface Types {
    Store: Store;
    RootAction: RootAction;
    RootState: RootState;
  }
}

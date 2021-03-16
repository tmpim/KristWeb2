// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useSelector } from "react-redux";
import { RootState } from "@store";
import { store } from "@app";
import {
  incrementNameTableLock, decrementNameTableLock
} from "@actions/MiscActions";

import Debug from "debug";
const debug = Debug("kristweb:name-table-lock");

export function useNameTableLock(): boolean {
  const nameTableLock = useSelector((s: RootState) => s.misc.nameTableLock);
  return nameTableLock > 0;
}

export interface NameTableLock {
  release: () => void;
}

export function lockNameTable(timeoutMs = 20000): NameTableLock {
  let _timeout: ReturnType<typeof setTimeout> | undefined = setTimeout(() => {
    debug("timeout reached, releasing name table lock");
    release();
  }, timeoutMs);

  function release() {
    if (_timeout !== undefined) {
      debug("name table lock being released");
      store.dispatch(decrementNameTableLock());

      debug("clearing name table lock timeout %o", _timeout);
      clearTimeout(_timeout);
      _timeout = undefined;
    }
  }

  debug("name table being locked");
  store.dispatch(incrementNameTableLock());

  return { release };
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import Debug from "debug";
const debug = Debug("kristweb:useHistoryState");

/**
 * Wrapper for useState that saves its value in the browser history stack
 * as location state. Note that this doesn't yet support computed state.
 *
 * The state's value must be serialisable, and less than 2 MiB.
 *
 * @param initialState - The initial value of the state.
 * @param stateKey - The key by which to store the state's value in the history
 *   stack.
 */
export function useHistoryState<S>(
  initialState: S,
  stateKey: string
): [S, (s: S) => void] {
  const history = useHistory();
  const location = useLocation<Partial<Record<string, S>>>();

  const [state, setState] = useState<S>(
    location?.state?.[stateKey] ?? initialState
  );

  // Wraps setState to update the stored state value and replace the entry on
  // the history stack (via `updateLocation`).
  function wrappedSetState(newState: S): void {
    debug("useHistoryState: setting state %s to %o", stateKey, newState);
    updateLocation(newState);
    setState(newState);
  }

  // Merge the new state into the location state (using stateKey) and replace
  // the entry on the history stack.
  function updateLocation(newState: S) {
    const updatedLocation = {
      ...location,
      state: {
        ...location?.state,
        [stateKey]: newState
      }
    };

    debug("useHistoryState: replacing updated location:", updatedLocation);
    history.replace(updatedLocation);
  }

  return [state, wrappedSetState];
}

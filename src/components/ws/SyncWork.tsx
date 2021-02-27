// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect } from "react";

import { useSelector } from "react-redux";
import { RootState } from "../../store";
import * as nodeActions from "../../store/actions/NodeActions";

import { store } from "../../App";

import * as api from "../../krist/api/api";
import { KristWorkDetailed } from "../../krist/api/types";

import Debug from "debug";
const debug = Debug("kristweb:sync-work");

export async function updateDetailedWork(): Promise<void> {
  debug("updating detailed work");
  const data = await api.get<KristWorkDetailed>("work/detailed");

  debug("work: %d", data.work);
  store.dispatch(nodeActions.setDetailedWork(data));
}

/** Sync the work with the Krist node on startup. */
export function SyncWork(): JSX.Element | null {
  const { lastBlockID } = useSelector((s: RootState) => s.node);

  useEffect(() => {
    // TODO: show errors to the user?
    updateDetailedWork().catch(console.error);
  }, [lastBlockID]);

  return null;
}

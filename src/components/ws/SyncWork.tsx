// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import * as nodeActions from "../../store/actions/NodeActions";

import { AppDispatch } from "../../App";

import * as api from "../../krist/api/api";
import { KristWorkDetailed } from "../../krist/api/types";

import Debug from "debug";
const debug = Debug("kristweb:sync-work");

export async function updateDetailedWork(dispatch: AppDispatch, syncNode: string): Promise<void> {
  debug("updating detailed work");
  const data = await api.get<KristWorkDetailed>(syncNode, "work/detailed");

  debug("work: %d", data.work);
  dispatch(nodeActions.setDetailedWork(data));
}

/** Sync the work with the Krist node on startup. */
export function SyncWork(): JSX.Element | null {
  const { lastBlockID, syncNode } = useSelector((s: RootState) => s.node);
  const dispatch = useDispatch();

  useEffect(() => {
    // TODO: show errors to the user?
    updateDetailedWork(dispatch, syncNode).catch(console.error);
  }, [dispatch, lastBlockID, syncNode]);

  return null;
}

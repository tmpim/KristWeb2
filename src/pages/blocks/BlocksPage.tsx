// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo } from "react";

import { useSelector } from "react-redux";
import { RootState } from "../../store";

import { PageLayout } from "../../layout/PageLayout";
import { BlocksResult } from "./BlocksResult";
import { BlocksTable } from "./BlocksTable";

import { useBooleanSetting } from "../../utils/settings";

export function BlocksPage(): JSX.Element {
  const [error, setError] = useState<Error | undefined>();

  // Used to handle memoisation and auto-refreshing
  const lastBlockID = useSelector((s: RootState) => s.node.lastBlockID);
  const shouldAutoRefresh = useBooleanSetting("autoRefreshTables");

  // If auto-refresh is disabled, use a static refresh ID
  const usedRefreshID = shouldAutoRefresh ? lastBlockID : 0;

  // Memoise the table so that it only updates the props (thus triggering a
  // re-fetch of the blocks) when something relevant changes
  const memoTable = useMemo(() => (
    <BlocksTable refreshingID={usedRefreshID} setError={setError} />
  ), [usedRefreshID, setError]);

  return <PageLayout
    className="blocks-page"
    withoutTopPadding
    negativeMargin

    titleKey={"blocks.title"}
    siteTitleKey={"blocks.siteTitle"}
  >
    {error
      ? <BlocksResult />
      : memoTable}
  </PageLayout>;
}

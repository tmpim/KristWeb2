// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useMemo } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { PageLayout } from "@layout/PageLayout";
import { APIErrorResult } from "@comp/results/APIErrorResult";
import { BlocksTable } from "./BlocksTable";

import { useBooleanSetting } from "@utils/settings";
import { useLinkedPagination } from "@utils/table";

interface Props {
  lowest?: boolean;
}

export function BlocksPage({ lowest }: Props): JSX.Element {
  const [error, setError] = useState<Error | undefined>();

  // Linked pagination from the table
  const [paginationComponent, setPagination] = useLinkedPagination();

  // Used to handle memoisation and auto-refreshing
  const lastBlockID = useSelector((s: RootState) => s.node.lastBlockID);
  const shouldAutoRefresh = useBooleanSetting("autoRefreshTables");

  // If auto-refresh is disabled, use a static refresh ID
  const usedRefreshID = shouldAutoRefresh ? lastBlockID : 0;

  // Memoise the table so that it only updates the props (thus triggering a
  // re-fetch of the blocks) when something relevant changes
  const memoTable = useMemo(() => (
    <BlocksTable
      refreshingID={usedRefreshID}
      lowest={lowest}
      setError={setError}
      setPagination={setPagination}
    />
  ), [usedRefreshID, lowest, setError, setPagination]);

  return <PageLayout
    className="blocks-page"

    titleKey={lowest ? "blocks.titleLowest" : "blocks.title"}
    siteTitleKey={lowest ? "blocks.siteTitleLowest" : "blocks.siteTitle"}

    extra={paginationComponent}
  >
    {error
      ? <APIErrorResult error={error} />
      : memoTable}
  </PageLayout>;
}

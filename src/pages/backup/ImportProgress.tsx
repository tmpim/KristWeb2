// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Progress } from "antd";

import { Trans } from "react-i18next";
import { TFns } from "@utils/i18n";

export type IncrProgressFn = () => void;
export type InitProgressFn = (total: number) => void;

interface ImportProgressHookResponse {
  progressBar: JSX.Element;
  onProgress: IncrProgressFn;
  initProgress: InitProgressFn;
  resetProgress: () => void;
}

export function useImportProgress(
  { t, tKey }: TFns
): ImportProgressHookResponse {
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(1);

  // Increment the progress bar when one of the wallets/contacts have been
  // imported
  const onProgress = () => setProgress(c => c + 1);

  function initProgress(total: number) {
    setProgress(0);
    setTotal(total);
  }

  function resetProgress() {
    setProgress(0);
    setTotal(1);
  }

  const progressBar = <>
    {/* Importing text */}
    <div style={{
      textAlign: "center",
      marginBottom: 12
    }}>
      <Trans t={t} i18nKey={tKey("progress")} count={total}>
        Importing <b>{{ count: total }}</b> items...
      </Trans>
    </div>

    {/* Progress bar */}
    <Progress
      percent={Math.round((progress / total) * 100)}
      status="active"
    />
  </>;

  return { progressBar, onProgress, initProgress, resetProgress };
}

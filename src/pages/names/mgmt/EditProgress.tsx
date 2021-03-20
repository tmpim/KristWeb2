// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Progress } from "antd";

import { Trans } from "react-i18next";
import { TFns } from "@utils/i18n";

interface EditProgressHookResponse {
  progressBar: JSX.Element;
  onProgress: () => void;
  initProgress: (total: number) => void;
  resetProgress: () => void;
}

export function useEditProgress(
  { t, tKey }: TFns
): EditProgressHookResponse {
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitTotal, setSubmitTotal] = useState(1);

  // Increment the progress bar when one of the names has been edited
  const onProgress = () => setSubmitProgress(c => c + 1);

  function initProgress(total: number) {
    setSubmitProgress(0);
    setSubmitTotal(total);
  }

  function resetProgress() {
    setSubmitProgress(0);
    setSubmitTotal(1);
  }

  const progressBar = <>
    {/* Submitting text */}
    <div style={{
      textAlign: "center",
      marginBottom: 12
    }}>
      <Trans t={t} i18nKey={tKey("progress")} count={submitTotal}>
        Editing <b>{{ count: submitTotal }}</b> names...
      </Trans>
    </div>

    {/* Progress bar */}
    <Progress
      percent={Math.round((submitProgress / submitTotal) * 100)}
      status="active"
    />
  </>;

  return { progressBar, onProgress, initProgress, resetProgress };
}

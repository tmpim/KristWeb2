// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";

export function AppLoading(): JSX.Element {
  return <div className="kw-preloader">
    {/* Spinner */}
    <div className="kw-preloader-spinner" />

    {/* Loading hint */}
    {/* NOTE: This is not translated, as usually this component is shown when
              the translations are being loaded! */}
    <span>Loading KristWeb...</span>
  </div>;
}

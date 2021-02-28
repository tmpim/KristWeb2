// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";

import { AppLayout } from "../layout/AppLayout";
import { StatusPage } from "./StatusPage";

export function CheckStatus(): JSX.Element {
  const ok = localStorage.getItem("wallet2-dad89f1a-3005-4cc1-afaa-4deba1e3c081") && localStorage.getItem("status") === "Ok";
  return ok ? <AppLayout /> : <StatusPage />;
}
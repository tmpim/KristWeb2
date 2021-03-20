// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt

import { AppLayout } from "@layout/AppLayout";
import { StatusPage } from "./StatusPage";

export function CheckStatus(): JSX.Element {
  const ok = localStorage.getItem("status") === "Ok";
  return ok ? <AppLayout /> : <StatusPage />;
}

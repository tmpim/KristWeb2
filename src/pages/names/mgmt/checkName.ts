// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Dispatch, SetStateAction } from "react";

import * as api from "@api";

interface CheckNameResponse {
  available: boolean;
}

export async function checkName(
  name: string,
  setNameAvailable: Dispatch<SetStateAction<boolean | undefined>>
): Promise<void> {
  try {
    const url = `names/check/${encodeURIComponent(name)}`;
    const { available } = await api.get<CheckNameResponse>(url);
    setNameAvailable(available);
  } catch (err) {
    console.error(err);
    setNameAvailable(undefined);
  }
}

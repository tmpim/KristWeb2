// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useTranslation, Trans } from "react-i18next";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";

import { Mode } from "./NameEditModal";

interface Props {
  count: number;
  recipient?: string;
  mode: Mode;
}

export function SuccessNotifContent({
  count,
  recipient,
  mode
}: Props): JSX.Element | null {
  const { t } = useTranslation();

  // Show the appropriate message, if this is all the owner's names
  if (mode === "transfer") {
    // Transfer names success notification
    return <Trans
      t={t}
      i18nKey={"nameTransfer.successDescription"}
      count={count}
    >
      Transferred <b>{{ count }}</b> names to
      <ContextualAddress address={recipient!} />.
    </Trans>;
  } else if (mode === "update") {
    // Update names success notification
    return <Trans
      t={t}
      i18nKey={"nameUpdate.successDescription"}
      count={count}
    >
      Updated <b>{{ count }}</b> names.
    </Trans>;
  } else {
    return null;
  }
}

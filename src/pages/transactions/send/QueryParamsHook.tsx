// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo } from "react";
import { message } from "antd";

import { useTFns } from "@utils/i18n";

import { useLocation } from "react-router-dom";

import {
  useAddressPrefix, useNameSuffix, isValidAddress, getNameParts
} from "@utils/krist";

interface Res {
  to?: string;
  amount?: number;
  metadata?: string;
}

export function useSendTxQuery(): Res {
  const { tStr } = useTFns("sendTransaction.");
  const search = useLocation().search;

  const addressPrefix = useAddressPrefix();
  const nameSuffix = useNameSuffix();

  // Memoise the query parsing, as notifications are triggered directly here. To
  // avoid spamming them, this should only run once per query string.
  return useMemo(() => {
    const query = new URLSearchParams(search);

    // Fetch the form parameters from the query string
    const rawTo = query.get("to")?.trim();
    const rawAmount = query.get("amount")?.trim();
    const rawMetadata = query.get("metadata");

    // Validate the parameters
    const toValid = rawTo && (isValidAddress(addressPrefix, rawTo)
      || !!getNameParts(nameSuffix, rawTo));

    const parsedAmount = rawAmount ? parseInt(rawAmount) : undefined;
    const amountValid = rawAmount && !isNaN(parsedAmount!) && parsedAmount! > 0;

    const metadataValid = rawMetadata && rawMetadata.length < 255;

    // Show a notification if any parameter is invalid
    if ((rawTo && !toValid)
      || (rawAmount && !amountValid)
      || (rawMetadata && !metadataValid)) {
      message.error(tStr("errorInvalidQuery"));
      return {};
    }

    // The parameters were valid (or non-existent), return them
    return {
      to: rawTo || undefined,
      amount: parsedAmount,
      metadata: rawMetadata || undefined
    };
  }, [tStr, search, addressPrefix, nameSuffix]);
}

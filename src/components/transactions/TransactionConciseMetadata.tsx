// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import classNames from "classnames";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { KristTransaction } from "@api/types";
import { stripNameFromMetadata } from "@utils/currency";

import "./TransactionConciseMetadata.less";

interface Props {
  transaction?: KristTransaction;
  metadata?: string;
  limit?: number;
  className?: string;
}

/**
 * Trims the name and metaname from the start of metadata, and truncates it
 * to a specified amount of characters.
 */
export function TransactionConciseMetadata({ transaction, metadata, limit = 30, className }: Props): JSX.Element | null {
  const nameSuffix = useSelector((s: RootState) => s.node.currency.name_suffix);

  // Don't render anything if there's no metadata (after the hooks)
  const meta = metadata || transaction?.metadata;
  if (!meta) return null;

  // Strip the name from the start of the transaction metadata, if it is present
  const hasName = transaction && (transaction.sent_name || transaction.sent_metaname);
  const withoutName = hasName
    ? stripNameFromMetadata(nameSuffix, meta)
    : meta;

  // Trim it down to the limit if necessary
  const wasTruncated = withoutName.length > limit;
  const truncated = wasTruncated ? withoutName.substr(0, limit) : withoutName;

  const classes = classNames("transaction-concise-metadata", className, {
    "transaction-concise-metadata-truncated": wasTruncated
  });

  return <span className={classes}>{truncated}</span>;
}

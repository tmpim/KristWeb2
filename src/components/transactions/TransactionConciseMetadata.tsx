// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";

import { Link } from "react-router-dom";

import { KristTransaction } from "@api/types";
import { useNameSuffix, stripNameFromMetadata } from "@utils/krist";

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
export function TransactionConciseMetadata({
  transaction: tx,
  metadata,
  limit = 30,
  className
}: Props): JSX.Element | null {
  const nameSuffix = useNameSuffix();

  // Don't render anything if there's no metadata (after the hooks)
  const meta = metadata || tx?.metadata;
  if (!meta) return null;

  // Strip the name from the start of the transaction metadata, if it is present
  const hasName = tx && (tx.sent_name || tx.sent_metaname);
  const withoutName = hasName
    ? stripNameFromMetadata(nameSuffix, meta)
    : meta;

  // Trim it down to the limit if necessary
  const wasTruncated = withoutName.length > limit;
  const truncated = wasTruncated ? withoutName.substr(0, limit) : withoutName;

  const classes = classNames("transaction-concise-metadata", className, {
    "transaction-concise-metadata-truncated": wasTruncated
  });

  // Link to the transaction if it is available
  return tx
    ? (
      <Link
        className={classes}
        to={`/network/transactions/${encodeURIComponent(tx.id)}`}
      >
        {truncated}
      </Link>
    )
    : <span className={classes}>{truncated}</span>;
}

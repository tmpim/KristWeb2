// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useCallback } from "react";

import { Trans } from "react-i18next";
import { useTFns } from "@utils/i18n";

import { KristBlock } from "@api/types";

import { KristValue } from "@comp/krist/KristValue";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { DateTime } from "@comp/DateTime";

interface Props {
  block: KristBlock;
}

export function BlockMobileItem({ block }: Props): JSX.Element {
  const { t, tKey } = useTFns("blocks.");

  const Hash = useCallback(() => (
    <span className="block-mobile-hash-value">
      {block.hash?.substr(0, 12) || ""}
    </span>
  ), [block.hash]);

  const Difficulty = useCallback(() => (
    <span className="block-difficulty-value">
      {block.difficulty.toLocaleString()}
    </span>
  ), [block.difficulty]);

  return <div className="card-list-item block-mobile-item">
    {/* Block value */}
    <div className="block-value">
      <KristValue value={block.value} />
    </div>

    {/* Block height */}
    <div className="block-height">
      {t(tKey("mobileHeight"), { height: block.height })}
    </div>

    {/* Miner */}
    <div className="block-miner">
      <Trans i18nKey={tKey("mobileMiner")}>
        <span className="block-field">Miner:</span>
        <ContextualAddress address={block.address} noLink noTooltip />
      </Trans>
    </div>

    <div className="block-technical-row">
      {/* Hash */}
      {block.hash && <>
        <span className="block-mobile-hash">
          <Trans i18nKey={tKey("mobileHash")}>
            <span className="block-field">Hash:</span>
            <Hash />
          </Trans>
        </span>
        <span className="sep" />
      </>}

      {/* Difficulty */}
      <span className="block-difficulty">
        <Trans i18nKey={tKey("mobileDifficulty")}>
          <span className="block-field">Difficulty:</span>
          <Difficulty />
        </Trans>
      </span>
    </div>


    {/* Mined time */}
    <div className="block-mined">
      <DateTime date={block.time} />
    </div>
  </div>;
}

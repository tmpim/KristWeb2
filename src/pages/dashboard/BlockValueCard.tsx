// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Card, Skeleton, Typography, Progress } from "antd";

import { useSelector } from "react-redux";
import { RootState } from "../../store";

import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";

import { KristValue } from "../../components/KristValue";

const { Text } = Typography;

export function BlockValueCard(): JSX.Element {
  const { t } = useTranslation();

  const work = useSelector((s: RootState) => s.node.detailedWork);
  const hasNames = (work?.unpaid || 0) > 0;

  return <Card title={t("dashboard.blockValueCardTitle")} className="dashboard-card dashboard-card-block-value">
    <Skeleton paragraph={{ rows: 2 }} title={false} active loading={!work}>
      {work && <>
        {/* Main block value */}
        <KristValue
          value={work.block_value}
          long
          green={hasNames}
          className="dashboard-block-value-main"
        />

        {hasNames && <>
          {/* Base value + names */}
          <div className="dashboard-block-value-summary">
            <Text type="secondary"><Trans t={t} i18nKey="dashboard.blockValueBaseValue">
              Base value (<KristValue value={work.base_value} green />)
            </Trans></Text>
            &nbsp;+&nbsp;
            <b><Link to="/network/names">
              {t("dashboard.blockValueBaseValueNames", { count: work.unpaid })}
            </Link></b>
          </div>

          {/* Progress bar */}
          <Progress percent={(work.decrease.reset / 500) * 100} showInfo={false} />

          {/* Decrease and reset */}
          <div className="dashboard-block-value-progress-text">
            {/* Decrease */}
            {work.decrease.blocks !== work.decrease.reset && <>
              <Trans t={t} i18nKey="dashboard.blockValueNextDecrease" count={work.decrease.blocks}>
                Decreases by
                <KristValue value={work.decrease.value} />
                in
                <b style={{ whiteSpace: "nowrap" }}>{{ count: work.decrease.blocks }}</b>
              </Trans>

              <span className="dashboard-block-value-progress-middot">&middot;</span>
            </>}

            {/* Reset */}
            <Trans t={t} i18nKey="dashboard.blockValueReset" count={work.decrease.reset}>
              Resets in
              <b style={{ whiteSpace: "nowrap" }}>{{ count: work.decrease.reset }}</b>
            </Trans>
          </div>
        </>}

        {/* Filler explanation when there are no unpaid names */}
        {!hasNames && (
          <div className="dashboard-block-value-empty-description">
            <Trans t={t} i18nKey="dashboard.blockValueEmptyDescription">
              The block value increases when <Link to="/network/names">names</Link> are purchased.
            </Trans>
          </div>
        )}
      </>}
    </Skeleton>
  </Card>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect, useMemo } from "react";
import { Card, Skeleton, Empty } from "antd";

import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useTranslation } from "react-i18next";

// import { LineCanvas } from "@nivo/line";
// import { SizeMe } from "react-sizeme";
import { Line } from "react-chartjs-2";

import { APIResponse } from "../../krist/api/types";

import { SmallResult } from "../../components/SmallResult";
import { throttle } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:block-difficulty-card");

export function BlockDifficultyCard(): JSX.Element {
  const { t } = useTranslation();

  const syncNode = useSelector((s: RootState) => s.node.syncNode);
  const lastBlockID = useSelector((s: RootState) => s.node.lastBlockID);
  const work = useSelector((s: RootState) => s.node.detailedWork?.work);

  const [workOverTime, setWorkOverTime] = useState<{ x: Date; y: number }[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  async function _fetchWorkOverTime(): Promise<void> {
    try {
      debug("fetching work over time");

      const res = await fetch(syncNode + "/work/day");
      if (!res.ok || res.status !== 200) throw new Error(res.statusText);

      const data: APIResponse<{ work: number[] }> = await res.json();
      if (!data.ok || data.error) throw new Error(data.error);

      const processedWork = data.work.map((work, i, arr) =>
        ({ x: new Date(Date.now() - ((arr.length - i) * 60000)), y: work }));

      setWorkOverTime(processedWork);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const fetchWorkOverTime = useMemo(() =>
    throttle(_fetchWorkOverTime, 300, { leading: false, trailing: true }), []);

  useEffect(() => {
    if (!syncNode) return;
    fetchWorkOverTime();
  }, [syncNode, lastBlockID]);

  function chart(): JSX.Element {
    return <Line
      height={200}

      data={{
        datasets: [{
          label: "Work",

          backgroundColor: "#6495ed33",
          borderColor: "#6495ed",
          borderWidth: 2,
          pointRadius: 0,

          data: workOverTime
        }]
      }}

      options={{
        maintainAspectRatio: false,

        animation: { duration: 0 },
        hover: { animationDuration: 0 },
        responsiveAnimationDuration: 0,

        legend: {
          display: false
        },

        elements: {
          line: { tension: 0 }
        },

        tooltips: {
          mode: "index",
          intersect: false,
          displayColors: false,
          position: "nearest"
        },

        scales: {
          xAxes: [{
            type: "time",
            bounds: "data",

            ticks: {
              maxTicksLimit: 12,
              fontColor: "#8991ab",
              fontSize: 11,
              padding: 8
            },

            gridLines: {
              drawBorder: true,
              drawTicks: true,
              color: "#434a6b",
              tickMarkLength: 1,
              zeroLineWidth: 1,
              zeroLineColor: "#434a6b"
            }
          }],

          yAxes: [{
            type: "linear",

            ticks: {
              maxTicksLimit: 6,
              fontColor: "#8991ab",
              fontSize: 11,
              suggestedMin: 100,
              suggestedMax: 100000,
              beginAtZero: true,
              padding: 8
            },

            gridLines: {
              drawBorder: true,
              drawTicks: true,
              color: "#434a6b",
              tickMarkLength: 1,
              zeroLineWidth: 1,
              zeroLineColor: "#434a6b"
            }
          }]
        }
      }}
    />;
  }

  const isEmpty = !loading && error;

  return <Card title={t("dashboard.blockDifficultyCardTitle")} className={"dashboard-card dashboard-card-block-difficulty " + (isEmpty ? "empty" : "")}>
    <Skeleton paragraph={{ rows: 2 }} title={false} active loading={loading}>
      {error
        ? <SmallResult status="error" title={t("error")} subTitle={t("dashboard.blockDifficultyError")} />
        : (workOverTime
          ? chart()
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
    </Skeleton>
  </Card>;
}

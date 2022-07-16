// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import { Card, Skeleton, Empty, Row, Col, Tooltip, Select } from "antd";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@store";
import { useTranslation, Trans } from "react-i18next";

import { Line } from "react-chartjs-2";

import * as api from "@api";
import { estimateHashRate } from "@utils/krist";

import { trailingThrottleState } from "@utils";
import { useBooleanSetting } from "@utils/settings";

import { SmallResult } from "@comp/results/SmallResult";
import { Statistic } from "@comp/Statistic";

import Debug from "debug";
const debug = Debug("kristweb:block-difficulty-card");

// =============================================================================
// Chart.JS theming options
// =============================================================================
const CHART_FILL_COLOUR = "#6495ed33";
const CHART_LINE_COLOUR = "#6495ed";
const CHART_GRID_COLOUR = "#434a6b";
const CHART_FONT_COLOUR = "#8991ab";

const CHART_HEIGHT = 180;

const CHART_OPTIONS_BASE = {
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
  }
};

const CHART_DATASET_OPTIONS = {
  backgroundColor: CHART_FILL_COLOUR,
  borderColor: CHART_LINE_COLOUR,
  borderWidth: 2,
  pointRadius: 0
};

const CHART_OPTIONS_X_AXIS = {
  type: "time",
  bounds: "data",

  ticks: {
    maxTicksLimit: 12,
    fontColor: CHART_FONT_COLOUR,
    fontSize: 11,
    padding: 8,
    lineHeight: 0.5 // Push the tick text to the bottom
  },

  gridLines: {
    drawBorder: true,
    drawTicks: true,
    color: CHART_GRID_COLOUR,
    tickMarkLength: 1,
    zeroLineWidth: 1,
    zeroLineColor: CHART_GRID_COLOUR
  }
};

const CHART_OPTIONS_Y_AXIS = {
  type: "linear",

  ticks: {
    maxTicksLimit: 6,
    fontColor: CHART_FONT_COLOUR,
    fontSize: 11,
    suggestedMin: 100,
    suggestedMax: 100000,
    beginAtZero: true,
    padding: 8,
    callback(value: number | string): string {
      return Number(value).toLocaleString();
    }
  },

  gridLines: {
    drawBorder: true,
    drawTicks: true,
    color: CHART_GRID_COLOUR,
    tickMarkLength: 1,
    zeroLineWidth: 1,
    zeroLineColor: CHART_GRID_COLOUR
  }
};

const WORK_THROTTLE = 500;
async function _fetchWorkOverTime(): Promise<{ x: Date; y: number }[]> {
  debug("fetching work over time");
  const data = await api.get<{ work: number[] }>("work/day");

  // Convert the array indices to Dates, based on the fact that the array
  // should contain one block per 60 seconds (typically 1440 elements).
  // This can be passed directly into Chart.JS.
  return data.work.map((work, i, arr) => ({
    x: new Date(Date.now() - ((arr.length - i) * (60 * 1000))),
    y: work
  }));
}

export function BlockDifficultyCard(): JSX.Element {
  const { t } = useTranslation();

  const syncNode = api.useSyncNode();
  const lastBlockID = useSelector((s: RootState) => s.node.lastBlockID);
  const work = useSelector((s: RootState) => s.node.detailedWork?.work);
  const constants = useSelector((s: RootState) => s.node.constants, shallowEqual);

  const [workOverTime, setWorkOverTime] = useState<{ x: Date; y: number }[] | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);

  const [chartMode, setChartMode] = useState<"linear" | "logarithmic">("linear");

  function changeChartMode(value: "linear" | "logarithmic") {
    // Persist the change to localStorage
    debug("setting chart mode to %s", value);
    localStorage.setItem("dashboardDifficultyChartMode", value);
    setChartMode(value);
  }

  // Load the chartMode from localStorage on startup if possible (done only on
  // first render, because localStorage is blocking)
  useEffect(() => {
    const storedMode = localStorage.getItem("dashboardDifficultyChartMode");
    if (storedMode === "linear" || storedMode === "logarithmic") {
      debug("using saved chart mode %s", storedMode);
      setChartMode(storedMode);
    }
  }, []);

  const fetchWorkOverTime = useMemo(() =>
    trailingThrottleState(_fetchWorkOverTime, WORK_THROTTLE, false, setWorkOverTime, setError, setLoading), []);

  // Fetch the new work data whenever the sync node, block ID, or node constants
  // change. This is usually only going to be triggered by the block ID
  // changing, which is handled by WebsocketService.
  useEffect(() => {
    if (!syncNode) return;
    fetchWorkOverTime();
  }, [syncNode, lastBlockID, fetchWorkOverTime]);

  // Use a date format string appropriate for the user's locale and settings.
  // Only applies to the tooltip.
  const showNativeDates = useBooleanSetting("showNativeDates");
  const tooltipDateFormat = showNativeDates ? "ll LTS" : "YYYY/MM/DD HH:mm:ss";

  function chart(): JSX.Element {
    return <Line
      height={CHART_HEIGHT}

      data={{
        datasets: [{
          ...CHART_DATASET_OPTIONS,

          label: t("dashboard.blockDifficultyChartWork"),
          data: workOverTime
        }]
      }}

      options={{
        ...CHART_OPTIONS_BASE,

        scales: {
          xAxes: [{
            ...CHART_OPTIONS_X_AXIS,
            time: {
              tooltipFormat: tooltipDateFormat
            }
          }],
          yAxes: [{
            ...CHART_OPTIONS_Y_AXIS,
            type: chartMode,
            ticks: {
              ...CHART_OPTIONS_Y_AXIS.ticks,
              suggestedMin: constants.min_work,
              suggestedMax: constants.max_work
            }
          }]
        }
      }}
    />;
  }

  /* In its own component to work with i18next Trans */
  function HashRate(): JSX.Element {
    return <span className="difficulty-hash-rate-rate">
      {estimateHashRate(work || 0, constants.seconds_per_block)}
    </span>;
  }

  function display(): JSX.Element | null {
    if (!work || !workOverTime) return null;

    return <Row>
      <Col span={24} md={4} className="left-col">
        {/* Current work */}
        <Statistic value={work.toLocaleString()} />

        {/* Approximate network hash rate */}
        <Tooltip title={t("dashboard.blockDifficultyHashRateTooltip")}>
          <div className="difficulty-hash-rate">
            <Trans t={t} i18nKey="dashboard.blockDifficultyHashRate">
              Approx. <HashRate />
            </Trans>
          </div>
        </Tooltip>

        {/* Spacer to push the dropdown to the bottom */}
        <div className="spacer" />

        {/* Chart Y-axis scale dropdown */}
        <Select
          value={chartMode}
          className="chart-mode-dropdown"
          onSelect={changeChartMode}
        >
          <Select.Option value="linear">{t("dashboard.blockDifficultyChartLinear")}</Select.Option>
          <Select.Option value="logarithmic">{t("dashboard.blockDifficultyChartLog")}</Select.Option>
        </Select>
      </Col>

      {/* Work over time chart */}
      <Col span={24} md={20}>{chart()}</Col>
    </Row>;
  }

  const isEmpty = !loading && error;
  const classes = classNames("kw-card", "dashboard-card-block-difficulty", {
    "empty": isEmpty
  });

  return <Card title={t("dashboard.blockDifficultyCardTitle")} className={classes}>
    <Skeleton paragraph={{ rows: 2 }} title={false} active loading={loading}>
      {error
        ? <SmallResult status="error" title={t("error")} subTitle={t("dashboard.blockDifficultyError")} />
        : (work && workOverTime
          ? display()
          : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
    </Skeleton>
  </Card>;
}

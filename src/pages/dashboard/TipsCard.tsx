// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Card, Button } from "antd";
import { CaretLeftOutlined, CaretRightOutlined } from "@ant-design/icons";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@store";
import { setTip } from "@actions/MiscActions";

import { mod } from "@utils";
import { useMountEffect } from "@utils/hooks";
import { useTFns } from "@utils/i18n";

import Markdown from "markdown-to-jsx";
import { useRelativeMarkdownLink } from "@comp/krist/MarkdownLink";

import Debug from "debug";
const debug = Debug("kristweb:tips-card");

// All the tips must exist in `public/locales/en.json` under `dashboard.tips`.
export const TIP_COUNT = 15;

function saveTip(tip: number) {
  localStorage.setItem("tip", tip.toString());
}

/** Advance the tip on app start. */
export function AdvanceTip(): JSX.Element | null {
  const dispatch = useDispatch();
  const currentTip = useSelector((s: RootState) => s.misc.tip);

  useMountEffect(() => {
    const next = mod(currentTip + 1, TIP_COUNT);

    debug("AdvanceTip setting tip from %d to %d", currentTip, next);

    dispatch(setTip(next));
    saveTip(next);
  });

  return null;
}

export function TipsCard(): JSX.Element {
  const { tStr } = useTFns("dashboard.");

  const dispatch = useDispatch();
  const rawTip = useSelector((s: RootState) => s.misc.tip);
  const currentTip = mod(rawTip, TIP_COUNT);

  const changeTip = (tip: number) => {
    dispatch(setTip(tip));
    saveTip(tip);
  };
  const previousTip = () => changeTip(mod(currentTip - 1, TIP_COUNT));
  const nextTip = () => changeTip(mod(currentTip + 1, TIP_COUNT));

  const tipText = tStr(`tips.${currentTip}`);

  const MarkdownLink = useRelativeMarkdownLink();

  return <Card
    title={tStr("tipsCardTitle")}
    className="kw-card dashboard-card-tips"

    extra={<div className="dashboard-tips-pagination">
      <Button type="link" onClick={previousTip}>
        <CaretLeftOutlined />
        {tStr("tipsPrevious")}
      </Button>

      <Button type="link" onClick={nextTip}>
        {tStr("tipsNext")}
        <CaretRightOutlined />
      </Button>
    </div>}
  >
    <p>
      <Markdown options={{
        disableParsingRawHTML: true,
        overrides: { a: MarkdownLink }
      }}>
        {tipText}
      </Markdown>
    </p>
  </Card>;
}

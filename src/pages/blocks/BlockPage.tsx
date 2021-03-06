// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect } from "react";
import { Row, Col, Skeleton, Button, Tooltip } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { PageLayout } from "../../layout/PageLayout";
import { APIErrorResult } from "@comp/results/APIErrorResult";

import { Statistic } from "@comp/Statistic";
import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { BlockHash } from "./BlockHash";
import { KristValue } from "@comp/krist/KristValue";
import { DateTime } from "@comp/DateTime";

import * as api from "@api";
import { KristBlock } from "@api/types";

import "./BlockPage.less";

interface ParamTypes {
  id: string;
}

function PageContents({ block }: { block: KristBlock }): JSX.Element {
  return <>
    <Row className="block-info-row">
      {/* Height */}
      <Col span={24} md={12} lg={8}>
        <Statistic titleKey="block.height" value={block.height.toLocaleString()}/>
      </Col>

      {/* Miner */}
      <Col span={24} md={12} lg={8}>
        <Statistic
          titleKey="block.miner"
          value={<ContextualAddress address={block.address} />}
        />
      </Col>

      {/* Value */}
      <Col span={24} md={12} lg={8}>
        <Statistic
          titleKey="block.value"
          value={<KristValue
            value={block.value}
            long
            green={block.value > 1}
          />}
        />
      </Col>

      {/* Time */}
      <Col span={24} md={12} lg={8}>
        <Statistic
          titleKey="block.time"
          value={<DateTime date={block.time} />}
        />
      </Col>

      {/* Difficulty */}
      <Col span={24} md={12} lg={8}>
        <Statistic
          titleKey="block.difficulty"
          value={block.difficulty.toLocaleString()}
        />
      </Col>

      {/* Hash */}
      <Col span={24}>
        <Statistic
          titleKey="block.hash"
          value={<BlockHash alwaysCopyable hash={block.hash} />}
          className="statistic-block-hash"
        />
      </Col>
    </Row>
  </>;
}

function NavButtons({ block }: { block?: KristBlock }): JSX.Element {
  const { t } = useTranslation();
  const lastBlockID = useSelector((s: RootState) => s.node.lastBlockID);

  // TODO: The Krist network's genesis block actually starts at ID 7 due to
  //       a migration issue, so this hasPrevious check is never going to be
  //       used.
  const hasPrevious = block && block.height > 1;
  const previousID = hasPrevious ? block!.height - 1 : 0;
  const previousBtn = (
    <Button disabled={!hasPrevious} className="block-prev">
      <LeftOutlined />
      {t("block.previous")}
    </Button>
  );

  const hasNext = block && block.height < lastBlockID;
  const nextID = hasNext ? block!.height + 1 : 0;
  const nextBtn = (
    <Button
      className="block-next"
      type="primary"
      disabled={!hasNext}
    >
      {t("block.next")}
      <RightOutlined />
    </Button>
  );

  return <div className="block-nav-buttons">
    {/* Previous block button */}
    <Tooltip
      title={hasPrevious
        ? t("block.previousTooltip", { id: previousID })
        : t("block.previousTooltipNone")}
    >
      {/* Wrap in a link if the button is enabled */}
      {hasPrevious
        ? (
          <Link to={`/network/blocks/${encodeURIComponent(previousID)}`} replace>
            {previousBtn}
          </Link>
        )
        : previousBtn}
    </Tooltip>

    {/* Next block button */}
    <Tooltip
      title={hasNext
        ? t("block.nextTooltip", { id: nextID })
        : t("block.nextTooltipNone")}
    >
      {/* Wrap in a link if the button is enabled */}
      {hasNext
        ? (
          <Link to={`/network/blocks/${encodeURIComponent(nextID)}`} replace>
            {nextBtn}
          </Link>
        )
        : nextBtn}
    </Tooltip>
  </div>;
}

export function BlockPage(): JSX.Element {
  // Used to refresh the block data on syncNode change
  const syncNode = api.useSyncNode();
  const { t } = useTranslation();

  const { id } = useParams<ParamTypes>();
  const [kristBlock, setKristBlock] = useState<KristBlock | undefined>();
  const [error, setError] = useState<Error | undefined>();

  // Load the block on page load
  useEffect(() => {
    api.get<{ block: KristBlock }>("blocks/" + encodeURIComponent(id))
      .then(res => setKristBlock(res.block))
      .catch(err => { console.error(err); setError(err); });
  }, [syncNode, id]);

  // Change the page title depending on whether or not the block has loaded
  const titleData = kristBlock
    ? {
      siteTitle: t("block.siteTitleBlock", { id: kristBlock.height }),
      subTitle: t("block.subTitleBlock", { id: kristBlock.height })
    }
    : { siteTitleKey: "block.siteTitle" };

  return <PageLayout
    className="block-page"
    titleKey="block.title"
    {...titleData}
    extra={<NavButtons block={kristBlock} />}
  >
    {error
      ? (
        <APIErrorResult
          error={error}

          invalidParameterTitleKey="block.resultInvalidTitle"
          invalidParameterSubTitleKey="block.resultInvalid"

          notFoundMessage="block_not_found"
          notFoundTitleKey="block.resultNotFoundTitle"
          notFoundSubTitleKey="block.resultNotFound"
        />
      )
      : (kristBlock
        ? <PageContents block={kristBlock} />
        : <Skeleton active />)}
  </PageLayout>;
}

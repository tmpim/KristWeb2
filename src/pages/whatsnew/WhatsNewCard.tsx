// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC } from "react";
import classNames from "classnames";
import { Card, Skeleton, Row, Tag } from "antd";

import { useTranslation } from "react-i18next";

import { WhatsNewItem } from "./types";

import Markdown from "markdown-to-jsx";
import { DateTime } from "@comp/DateTime";

import { slice } from "lodash-es";

interface Props {
  loading?: boolean;
  whatsNew?: WhatsNewItem[];
  baseURL?: string;
  repoURL: string;
  className?: string;
}

export function WhatsNewCard({
  loading,
  whatsNew,
  baseURL,
  repoURL,
  className
}: Props): JSX.Element {
  const { t } = useTranslation();

  const classes = classNames("kw-card", "whats-new-card-whats-new", className);

  return <Card title={t("whatsNew.cardWhatsNewTitle")} className={classes}>
    <Skeleton paragraph={{ rows: 4 }} title={false} active loading={loading}>
      {!loading && whatsNew && <>
        {/* Display the first 5 whats new items */}
        {slice(whatsNew, 0, 5).map((w, i) => (
          // I'm hesitant to use an index here, but there's nothing better
          <WhatsNew key={i} whatsNew={w} baseURL={baseURL} repoURL={repoURL} />
        ))}
      </>}
    </Skeleton>
  </Card>;
}

interface WhatsNewProps {
  whatsNew: WhatsNewItem;
  baseURL?: string;
  repoURL: string;
}

function WhatsNew({ whatsNew, baseURL, repoURL }: WhatsNewProps): JSX.Element {
  const { t } = useTranslation();

  // Allow overriding a link to make it open in a new tab and start with baseURL
  const OverrideLink: FC<HTMLAnchorElement> = ({ title, href, children }) => {
    // Force the link to start with baseURL if it's relative
    const absLink = href.startsWith("/")
      ? baseURL + href
      : href;

    return <a
      title={title}
      href={absLink}
      target="_blank" rel="noopener noreferrer"
    >
      {children}
    </a>;
  };

  return <div className="card-list-item whats-new-item">
    <div className="whats-new-body">
      {/* "New!" tag */}
      {whatsNew.new && (
        <Tag className="whats-new-new-tag">{t("whatsNew.new")}</Tag>
      )}

      {/* What's new item body */}
      <Markdown options={{
        disableParsingRawHTML: true,
        overrides: {
          a: OverrideLink
        }
      }}>
        {whatsNew.body}
      </Markdown>
    </div>

    <div className="whats-new-footer">
      {/* Author avatar */}
      {whatsNew.authorUsername && (
        <img
          className="whats-new-avatar"
          src={`https://github.com/${whatsNew.authorUsername}.png?size=16`}
        />
      )}

      {/* Author name */}
      {whatsNew.authorName && <>
        <span className="author-name">{whatsNew.authorName}</span>
        <span className="sep">&ndash;</span>
      </>}

      {/* Date and link to commits */}
      <a
        href={repoURL + "/commit/" + whatsNew.commitHash}
        target="_blank" rel="noopener noreferrer"
      >
        <DateTime className="whats-new-date" date={whatsNew.date} />
      </a>
    </div>
  </div>;
}

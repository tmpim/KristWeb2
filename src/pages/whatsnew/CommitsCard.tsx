// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";
import { Card, Skeleton, Row, Tag } from "antd";

import { useTranslation } from "react-i18next";

import { Commit } from "./types";

import { DateTime } from "@comp/DateTime";

import { slice } from "lodash-es";

interface Props {
  loading?: boolean;
  commits?: Commit[];
  repoURL: string;
  className?: string;
}

export function CommitsCard({
  loading,
  commits,
  repoURL,
  className
}: Props): JSX.Element {
  const { t } = useTranslation();

  const classes = classNames("kw-card", "whats-new-card-commits", className);

  return <Card title={t("whatsNew.cardCommitsTitle")} className={classes}>
    <Skeleton paragraph={{ rows: 4 }} title={false} active loading={loading}>
      {!loading && commits && <>
        {/* Display the first 5 commits */}
        {slice(commits, 0, 5).map(c => (
          <CommitItem key={c.hash} commit={c} repoURL={repoURL} />
        ))}

        {/* 'See more' link */}
        <Row className="card-more commits-more">
          <a href={repoURL + "/commits"} target="_blank" rel="noopener noreferrer">
            {t("whatsNew.cardCommitsSeeMore")}
          </a>
        </Row>
      </>}
    </Skeleton>
  </Card>;
}

interface CommitItemProps {
  commit: Commit;
  repoURL: string;
}

function CommitItem({ commit, repoURL }: CommitItemProps): JSX.Element {
  return <a
    className="card-list-item commit"
    href={repoURL + "/commit/" + commit.hash}
    target="_blank" rel="noopener noreferrer"
  >
    {/* Conventional commits type tag */}
    {commit.type && (
      <Tag className={"commit-type-tag commit-type-" + commit.type}>
        {commit.type}
      </Tag>
    )}

    {/* Commit subject */}
    <span className="commit-subject">{commit.subject}</span>

    {/* Commit author */}
    <div className="commit-author">
      {/* Author avatar */}
      {commit.avatar && (
        <img className="commit-avatar" src={commit.avatar} />
      )}

      {/* Author name */}
      <span className="author-name">{commit.authorName}</span>

      <span className="sep">&ndash;</span>

      {/* Commit time */}
      <DateTime className="commit-date" date={commit.authorDate} />
    </div>
  </a>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { FC, useEffect } from "react";
import classNames from "classnames";
import { PageHeader } from "antd";

import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import "./PageLayout.less";

export type PageLayoutProps = React.HTMLProps<HTMLDivElement> & {
  siteTitle?: string;
  siteTitleKey?: string;
  title?: React.ReactNode | string;
  titleKey?: string;
  subTitle?: React.ReactNode | string;
  subTitleKey?: string;

  extra?: React.ReactNode;
  noHeader?: boolean;

  className?: string;
  withoutTopPadding?: boolean;
}

export const PageLayout: FC<PageLayoutProps> = ({
  siteTitle, siteTitleKey,
  title, titleKey,
  subTitle, subTitleKey,

  extra, noHeader,

  className,
  withoutTopPadding,

  children, ...rest
}) => {
  const { t } = useTranslation();
  const history = useHistory();

  useEffect(() => {
    if      (siteTitle)    document.title = `${siteTitle} - KristWeb`;
    else if (siteTitleKey) document.title = `${t(siteTitleKey)} - KristWeb`;
  }, [t, siteTitle, siteTitleKey]);

  const classes = classNames("page-layout", className, {
    "page-layout-no-top-padding": withoutTopPadding
  });

  return <div className={classes} {...rest}>
    {/* Page header */}
    {!noHeader && (title || titleKey) && <PageHeader
      className="page-layout-header"

      title={title || (titleKey ? t(titleKey) : undefined)}
      subTitle={subTitle || (subTitleKey ? t(subTitleKey) : undefined)}
      extra={extra}

      onBack={() => history.goBack()}
    />}

    {/* Page contents */}
    <div className="page-layout-contents">
      {children}
    </div>
  </div>;
};

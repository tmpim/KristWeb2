// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import classNames from "classnames";
import { FrownOutlined, ExclamationCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { SmallResult, ResultProps } from "./SmallResult";
import { APIError } from "@api";

interface Props {
  error: Error;

  // Handles `invalid_parameter` errors
  invalidParameterTitleKey?: string;
  invalidParameterSubTitleKey?: string;

  // Handles 'not found' errors (e.g. `name_not_found`)
  notFoundMessage?: string;
  notFoundTitleKey?: string;
  notFoundSubTitleKey?: string;

  // Handles 'unknown' errors (completely optional)
  unknownTitleKey?: string;
  unknownSubTitleKey?: string;

  className?: string;
}

export function APIErrorResult({ error, className, ...props }: Props): JSX.Element {
  const { t } = useTranslation();

  const classes = classNames("kw-api-error-result", className);

  // Props shared by all the errors
  const errorProps: ResultProps = {
    className: classes,
    status: "error",
    icon: <QuestionCircleOutlined />,
    fullPage: true
  };

  // Handle the most commonly expected errors from the API
  if (error instanceof APIError) {
    if (error.message === "invalid_parameter" && props.invalidParameterTitleKey) {
      return <SmallResult
        {...errorProps}
        icon={<ExclamationCircleOutlined />}
        title={props.invalidParameterTitleKey}
        subTitle={props.invalidParameterSubTitleKey}
      />;
    }

    const { notFoundMessage } = props;
    if (notFoundMessage && error.message === notFoundMessage && props.notFoundTitleKey) {
      return <SmallResult
        {...errorProps}
        icon={<FrownOutlined />}
        title={props.notFoundTitleKey}
        subTitle={props.notFoundSubTitleKey}
      />;
    }
  }

  // Unknown error
  return <SmallResult
    {...errorProps}
    title={t(props.unknownTitleKey || "apiErrorResult.resultUnknownTitle")}
    subTitle={t(props.unknownSubTitleKey || "apiErrorResult.resultUnknown")}
  />;
}

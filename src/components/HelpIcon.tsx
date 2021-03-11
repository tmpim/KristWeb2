// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";
import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import "./HelpIcon.less";

interface Props {
  text?: string;
  textKey?: string;
  className?: string;
}

export function HelpIcon({ text, textKey, className }: Props): JSX.Element {
  const { t } = useTranslation();

  const classes = classNames("kw-help-icon", className);

  return <Tooltip title={textKey ? t(textKey) : text}>
    <QuestionCircleOutlined className={classes} />
  </Tooltip>;
}

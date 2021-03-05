// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Tree, Typography } from "antd";
import { CheckCircleOutlined, WarningOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

import { BackupResults, ResultType } from "./backupResults";

const { Paragraph } = Typography;

interface Props {
  results: BackupResults;
}

export function BackupResultsTree({ results }: Props): JSX.Element {
  return <>
    {/* Results summary */}
    <Paragraph></Paragraph>

    {/* Results tree */}
    <Tree
      showIcon
      defaultExpandAll
      showLine
      selectable={false}
    />
  </>;
}

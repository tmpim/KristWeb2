// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Button } from "antd";
import { FrownOutlined } from "@ant-design/icons";

import { useHistory } from "react-router-dom";
import { useTFns } from "@utils/i18n";

import { SmallResult } from "@comp/results/SmallResult";

interface Props {
  nyi?: boolean;
}

export function NotFoundPage({ nyi }: Props): JSX.Element {
  const { tStr } = useTFns("pageNotFound.");
  const history = useHistory();

  return <SmallResult
    icon={<FrownOutlined />}
    status="error"
    title={nyi ? tStr("nyiTitle") : tStr("resultTitle")}
    subTitle={nyi ? tStr("nyiSubTitle") : undefined}
    extra={(
      <Button type="primary" onClick={() => history.goBack()}>
        {tStr("buttonGoBack")}
      </Button>
    )}
    fullPage
  />;
}

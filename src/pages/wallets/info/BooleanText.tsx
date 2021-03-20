// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Typography } from "antd";

import { useTranslation } from "react-i18next";

const { Text } = Typography;

export function BooleanText({ value }: { value?: boolean }): JSX.Element {
  const { t } = useTranslation();

  return value
    ? <Text type="success">{t("myWallets.info.true")}</Text>
    : <Text type="danger">{t("myWallets.info.false")}</Text>;
}

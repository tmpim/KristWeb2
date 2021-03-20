// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Table, Typography } from "antd";

import { useTranslation } from "react-i18next";

import { AnalysedLanguage } from "./analyseLangs";

const { Text } = Typography;

interface MissingKeysTableProps {
  lang: AnalysedLanguage;
}

export function MissingKeysTable({ lang }: MissingKeysTableProps): JSX.Element {
  const { t } = useTranslation();

  return <Table
    title={() => t("settings.translations.tableUntranslatedKeys")}
    size="small"

    dataSource={lang.missingKeys}
    rowKey="k"

    columns={[
      {
        title: t("settings.translations.columnKey"),
        dataIndex: "k",
        key: "k",
        render: k => <Text code copyable>{k}</Text>
      },
      {
        title: t("settings.translations.columnEnglishString"),
        dataIndex: "v",
        key: "v",
        render: v => <Text copyable>{v}</Text>
      }
    ]}
  />;
}

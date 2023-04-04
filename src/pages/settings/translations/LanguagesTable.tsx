// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Table, Progress, Typography, Tooltip } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { AnalysedLanguages } from "./analyseLangs";
import { MissingKeysTable } from "./MissingKeysTable";

import { Flag } from "@comp/Flag";

const { Text } = Typography;

interface LanguagesTableProps {
  loading?: boolean;
  analysed?: AnalysedLanguages | undefined;
  showExpandableRow?: boolean;
}

export function LanguagesTable({
  loading,
  analysed,
  showExpandableRow
}: LanguagesTableProps): JSX.Element {
  const { t } = useTranslation();

  return <Table
    loading={loading}

    size="small"

    dataSource={analysed?.languages}
    rowKey="code"

    pagination={{ hideOnSinglePage: true }}

    columns={[
      {
        title: t("settings.translations.columnLanguageCode"),
        dataIndex: "code",
        key: "code",

        render: (code, row) => <>
          <Flag code={row?.language?.country} style={{ width: 22, height: 15, marginRight: 8 }} />
          {code}
        </>,

        width: 96,
      },
      {
        title: t("settings.translations.columnLanguage"),
        dataIndex: ["language", "name"],
        key: "language",
        render: (_, row) => <>
          {row?.language?.name}
          {row?.language?.nativeName && <Text type="secondary">&nbsp;({row.language.nativeName})</Text>}
        </>
      },
      {
        title: t("settings.translations.columnKeys"),
        key: "keys",
        render: (_, row) => row.error || !row.keys
          ? (
            <Tooltip title={row.error || t("settings.translations.errorNoKeys")}>
              <Text type="danger"><ExclamationCircleOutlined /></Text>
            </Tooltip>
          )
          : <>{row.keyCount.toLocaleString()}</>,
        sorter: (a, b) => a.keyCount - b.keyCount
      },
      {
        title: t("settings.translations.columnMissingKeys"),
        key: "missingKeys",
        render: (_, row) => (!row.error && row.keys &&
          <>{Math.max((analysed?.enKeyCount || 1) - row.keyCount, 0).toLocaleString()}</>),
        sorter: (a, b) => b.keyCount - a.keyCount
      },
      {
        title: t("settings.translations.columnProgress"),
        key: "progress",
        render: (_, row) => (!row.error && row.keys &&
          <Progress percent={Math.floor(Math.min(row.keyCount / (analysed?.enKeyCount || 1), 1) * 100)} />)
      }
    ]}

    expandable={{
      rowExpandable: row => !!row.missingKeys?.length && showExpandableRow !== false,
      expandedRowRender: row => <MissingKeysTable lang={row} />
    }}
  />;
}

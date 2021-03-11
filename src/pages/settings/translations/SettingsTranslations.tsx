// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Table, Progress, Typography, Tooltip, Button } from "antd";
import {
  ExclamationCircleOutlined, FileExcelOutlined
} from "@ant-design/icons";
import { FileDrop } from "react-file-drop";

import { useTranslation } from "react-i18next";
import { useMountEffect } from "@utils";

import { saveAs } from "file-saver";
import { analyseLanguages, AnalysedLanguages } from "./analyseLangs";
import { importJSON } from "./importJSON";
import { generateLanguageCSV } from "./exportCSV";

import { Flag } from "@comp/Flag";
import { SmallResult } from "@comp/results/SmallResult";
import { SettingsPageLayout } from "../SettingsPage";

const { Text } = Typography;

export function SettingsTranslations(): JSX.Element {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [analysed, setAnalysed] = useState<AnalysedLanguages | false | undefined>();

  async function onExportCSV() {
    if (!analysed) return;

    const data = await generateLanguageCSV(analysed.languages);
    const blob = new Blob([data], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "kristweb-translations.csv");
  }

  useMountEffect(() => {
    analyseLanguages()
      .then(setAnalysed)
      .catch(console.error)
      .finally(() => setLoading(false));
  });

  if (analysed === false) {
    return <SmallResult
      status="error"
      title={t("error")}
      subTitle={t("settings.translations.errorMissingLanguages")}
    />;
  }

  return <SettingsPageLayout
    pageName="Translations"
    extra={<div className="settings-translations-extra">
      {/* Import JSON button */}
      {/* Pretend to be an ant-design button (see ImportBackupModal.tsx) */}
      <label htmlFor="import-language-json" className="ant-btn">
        <span style={{ verticalAlign: "middle" }}>
          {t("settings.translations.importJSON")}
        </span>
      </label>
      <input
        id="import-language-json"
        type="file"
        accept="application/json"
        onChange={e => importJSON(e.target?.files)}
        style={{ display: "none" }}
      />

      {/* Export CSV button */}
      <Button icon={<FileExcelOutlined />} onClick={onExportCSV}>
        {t("settings.translations.exportCSV")}
      </Button>
    </div>}
  >
    <FileDrop
      className="full-page-dropper"
      onFrameDrop={e => importJSON(e?.dataTransfer?.files)}
    >
      <LanguagesTable loading={loading} analysed={analysed} />
    </FileDrop>
  </SettingsPageLayout>;
}

interface LanguagesTableProps {
  loading: boolean;
  analysed?: AnalysedLanguages | undefined;
}

function LanguagesTable({ loading, analysed }: LanguagesTableProps): JSX.Element {
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

        width: 64,
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
          <Progress percent={Math.round(Math.min(row.keyCount / (analysed?.enKeyCount || 1), 1) * 100)} />)
      }
    ]}

    expandable={{
      expandedRowRender: row => row.missingKeys && <Table
        title={() => t("settings.translations.tableUntranslatedKeys")}
        size="small"

        dataSource={row.missingKeys}
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
      />
    }}
  />;
}

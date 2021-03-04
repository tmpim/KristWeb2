// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState } from "react";
import { Table, Progress, Typography, Tooltip, Button } from "antd";
import { ExclamationCircleOutlined, FileExcelOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { getLanguages, Language } from "../../utils/i18n";
import { useMountEffect } from "../../utils";

import csvStringify from "csv-stringify";
import { saveAs } from "file-saver";

import { Flag } from "../../components/Flag";
import { SmallResult } from "../../components/results/SmallResult";
import { SettingsPageLayout } from "./SettingsPage";

const { Text } = Typography;

interface LangKeys { [key: string]: string }
interface AnalysedLanguage {
  code: string;
  language: Language;

  error?: string;
  keys?: LangKeys;
  keyCount: number;
  missingKeys?: { k: string; v: string }[];
}

const IGNORE_KEYS = /_(?:plural|interval|male|female|\d+)$/;
async function getLanguage([code, language]: [string, Language]): Promise<AnalysedLanguage> {
  const res = await fetch(`/locales/${code}.json`);
  if (!res.ok) throw new Error(res.statusText);

  const translation = await res.json();

  const isObject = (val: any) => typeof val === "object" && !Array.isArray(val);
  const addDelimiter = (a: string, b: string) => a ? `${a}.${b}` : b;

  // Find all translation keys recursively
  const keys = (obj: any = {}, head = ""): LangKeys =>
    Object.entries(obj)
      .reduce((product, [key, value]) => {
        // Ignore plurals, etc.
        if (IGNORE_KEYS.test(key)) return product;

        const fullPath = addDelimiter(head, key);
        return isObject(value as any)
          ? { ...product, ...keys(value, fullPath) }
          : {...product, [fullPath]: value };
      }, {});

  const langKeys = keys(translation);

  return { code, language, keys: langKeys, keyCount: Object.keys(langKeys).length };
}

interface CSVRow {
  Code: string;
  Language?: string;
  Key: string;
  Value?: string;
}
async function generateLanguageCSV(languages: AnalysedLanguage[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const en = languages.find(l => l.code === "en");
    if (!en) return reject("en missing");
    const enKeyNames = Object.keys(en.keys || {});

    // Merge all the languages and their keys together into one array
    const data = languages.reduce((out, lang) => {
      const { code, language, keys } = lang;
      const languageName = language.name;
      if (!keys) return out;

      // Keys from both en and this language
      const combinedKeys = [...new Set([...enKeyNames, ...Object.keys(keys)])];
      // Find the value for this key from the language, or null if not
      const keysWithValues = combinedKeys.map(k => [k, keys[k]]);

      // Generate all the rows for this language
      return [
        ...out,
        ...keysWithValues.map(([k, v]) => ({
          "Code": code,
          "Language": languageName,
          "Key": k, "Value": v
        }))
      ];
    }, [] as CSVRow[]);

    csvStringify(data, { header: true, quoted: true }, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

export function SettingsTranslations(): JSX.Element {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [analysed, setAnalysed] = useState<{
    enKeyCount: number;
    languages: AnalysedLanguage[];
  } | undefined>();

  const languages = getLanguages();

  async function loadLanguages() {
    if (!languages) return;

    // Fetch the locale file for each language code
    const codes = Object.entries(languages);
    const languageData = await Promise.allSettled(codes.map(getLanguage));

    const en = languageData.find(l => l.status === "fulfilled" && l.value.code === "en");
    const enKeys = en?.status === "fulfilled" ? en?.value.keys || {} : {};
    const enKeyCount = enKeys ? Object.keys(enKeys).length : 1;

    setLoading(false);
    setAnalysed({
      enKeyCount,
      languages: languageData.map((result, i) => result.status === "fulfilled"
        ? {
          code: codes[i][0],
          language: codes[i][1],
          keys: result.value.keys,
          keyCount: result.value.keyCount,
          missingKeys: result.value.keys
            ? Object.entries(enKeys)
              .filter(([k]) => result.value.keys && !result.value.keys[k])
              .map(([k, v]) => ({ k, v }))
            : []
        }
        : { code: codes[i][0], language: codes[i][1], keyCount: 0, error: result.reason.toString() })
    });
  }

  async function exportCSV() {
    if (!analysed) return;

    const data = await generateLanguageCSV(analysed.languages);
    const blob = new Blob([data], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "kristweb-translations.csv");
  }

  useMountEffect(() => { loadLanguages().catch(console.error); });

  if (!languages) return <SmallResult
    status="error"
    title={t("error")}
    subTitle={t("settings.translations.errorMissingLanguages")}
  />;

  return <SettingsPageLayout pageName="Translations" extra={
    <Button icon={<FileExcelOutlined />} onClick={exportCSV}>
      {t("settings.translations.exportCSV")}
    </Button>
  }>
    <Table
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
    />
  </SettingsPageLayout>;
}

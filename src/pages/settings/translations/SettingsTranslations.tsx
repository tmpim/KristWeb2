// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Button, Typography } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import { FileDrop } from "react-file-drop";

import { useTranslation } from "react-i18next";
import { useMountEffect } from "@utils";

import { useSelector } from "react-redux";
import { RootState } from "@store";

import { saveAs } from "file-saver";
import { analyseLanguages, AnalysedLanguages } from "./analyseLangs";
import { importJSON } from "./importJSON";
import { generateLanguageCSV } from "./exportCSV";
import { LanguagesTable } from "./LanguagesTable";
import { MissingKeysTable } from "./MissingKeysTable";

import { SmallResult } from "@comp/results/SmallResult";
import { SettingsPageLayout } from "../SettingsPage";

const { Title } = Typography;

export function SettingsTranslations(): JSX.Element {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [analysed, setAnalysed] = useState<AnalysedLanguages | false | undefined>();

  const importedLang = useSelector((s: RootState) => s.settings.importedLang);

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

      {/* Show stats for imported language */}
      {importedLang && <>
        <br />
        <Title level={3}>
          {t("settings.translations.importedLanguageTitle")}
        </Title>

        {/* Show the progress and key count (lazily) */}
        <LanguagesTable showExpandableRow={false} analysed={importedLang} />

        {/* Show the missing keys */}
        <MissingKeysTable lang={importedLang.languages[0]} />
      </>}
    </FileDrop>
  </SettingsPageLayout>;
}

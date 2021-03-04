// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState } from "react";
import { Input, Button, Typography } from "antd";

import { useTranslation, Trans } from "react-i18next";

import { PageLayout } from "../../layout/PageLayout";

import { BackupFormatType } from "../backup/backupFormats";
import { detectBackupFormat } from "../backup/backupParser";

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

export function DevPage(): JSX.Element {
  const { t } = useTranslation();

  const [code, setCode] = useState("");
  const [detectedFormatType, setDetectedFormatType] = useState<BackupFormatType>();
  const [decodeError, setDecodeError] = useState<string | undefined>();

  async function onImport() {
    console.log(code);
    try {
      const format = detectBackupFormat(code);
      setDecodeError(undefined);
      setDetectedFormatType(format.type);
    } catch (err) {
      console.error(err);

      const message = err.message // Translate the error if we can
        ? err.message.startsWith("import.") ? t(err.message) : err.message
        : t("import.decodeErrors.unknown");

      setDecodeError(message);
    }
  }

  // Display the detected format as a string, or "Invalid!" if there was an
  // error decoding it.
  function DetectFormatText(): JSX.Element | null {
    if (decodeError) return <Text type="danger">{t("import.detectedFormatInvalid")}</Text>;
    if (detectedFormatType) return <Text>{t(detectedFormatType)}</Text>;
    return null;
  }

  return <PageLayout
    title="Dev page"
    siteTitle="Dev page"
  >
    {/* Detected format */}
    {(detectedFormatType || decodeError) ? (
      <Paragraph>
        <Trans t={t} i18nKey="import.detectedFormat">
          <b>Detected format:</b> <DetectFormatText />
        </Trans>
      </Paragraph>
    ) : <></>}

    {/* Decode error */}
    {decodeError && <Paragraph type="danger">{decodeError}</Paragraph>}

    {/* Backup code textarea */}
    <TextArea
      rows={4}
      placeholder={t("import.textareaPlaceholder")}

      value={code}
      onChange={e => setCode(e.target.value)}
    />

    {/* Import button */}
    <Button type="primary" onClick={onImport}>
      {t("import.modalButton")}
    </Button>
  </PageLayout>;
}

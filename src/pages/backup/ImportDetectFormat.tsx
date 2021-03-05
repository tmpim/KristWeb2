// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { Typography } from "antd";

import { useTranslation, Trans, TFunction } from "react-i18next";
import { translateError } from "@utils/i18n";

import { BackupFormatType } from "./backupFormats";
import { decodeBackup } from "./backupParser";

import { debounce } from "lodash-es";

import Debug from "debug";
const debug = Debug("kristweb:import-detect-format");

const { Text, Paragraph } = Typography;

interface Props {
  code: string;
  setDecodeError: Dispatch<SetStateAction<string | undefined>>;
}

const DECODE_THROTTLE = 500;

// This is debounced to prevent wasting CPU time if the user is...for some
// reason...typing out their backup code (wtf??)
function _checkDecode(
  t: TFunction,
  code: string,
  setDetectedFormatType: Dispatch<SetStateAction<BackupFormatType | false | undefined>>,
  setDecodeError: Dispatch<SetStateAction<string | undefined>>
) {
  debug("checking decode");
  try {
    const backup = decodeBackup(code);
    debug("detected format: %s", backup.type);

    setDecodeError(undefined);
    setDetectedFormatType(backup.type);
  } catch (err) {
    console.error(err);
    setDecodeError(translateError(t, err, "import.decodeErrors.unknown"));
    setDetectedFormatType(false);
  }
}

export function ImportDetectFormat({ code, setDecodeError }: Props): JSX.Element {
  const { t } = useTranslation();

  const [detectedFormatType, setDetectedFormatType] = useState<BackupFormatType | false | undefined>();

  const checkDecode = useMemo(() => debounce(_checkDecode, DECODE_THROTTLE, { leading: true }), []);

  // Attempt to decode (throttled) when the code changes
  useEffect(() => {
    // Ignore empty codes
    if (!code || !code.trim()) {
      debug("clearing detected format");
      setDetectedFormatType(undefined);
      setDecodeError(undefined);
      return;
    }

    checkDecode(t, code.trim(), setDetectedFormatType, setDecodeError);
  }, [t, checkDecode, code, setDecodeError]);

  // Display the detected format as a string, or "Invalid!" if there was an
  // error decoding it.
  function DetectFormatText(): JSX.Element | null {
    if (detectedFormatType === false) { // Decode error
      return <Text type="danger">{t("import.detectedFormatInvalid")}</Text>;
    } else if (detectedFormatType) { // Successful decode
      return <Text>{t(detectedFormatType)}</Text>;
    }

    return null;
  }

  return detectedFormatType !== undefined ? (
    <Paragraph>
      <Trans t={t} i18nKey="import.detectedFormat">
        <b>Detected format:</b> <DetectFormatText />
      </Trans>
    </Paragraph>
  ) : <></>;
}

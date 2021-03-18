// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Typography } from "antd";

import { useTranslation, Trans } from "react-i18next";

import { BackupResults } from "./backupResults";

import "./BackupResultsSummary.less";

const { Paragraph } = Typography;

/** Provides a paragraph summarising the results of the backup import (e.g. the
 * amount of wallets imported, the amount of errors, etc.). */
export function BackupResultsSummary({ results }: { results: BackupResults }): JSX.Element {
  const { t } = useTranslation();

  // TODO: do this for contacts too
  const { newWallets, skippedWallets } = results;
  const warningCount = Object.values(results.messages.wallets)
    .reduce((acc, msgs) => acc + msgs.filter(m => m.type === "warning").length, 0);
  const errorCount = Object.values(results.messages.wallets)
    .reduce((acc, msgs) => acc + msgs.filter(m => m.type === "error").length, 0);

  return <Paragraph className="backup-results-summary">
    {/* New wallets imported count */}
    <div className="summary-wallets-imported">
      {newWallets > 0
        ? (
          <Trans t={t} i18nKey="import.results.walletsImported" count={newWallets}>
            <span className="positive">
              {{ count: newWallets }} new wallet
            </span>
            was imported.
          </Trans>
        )
        : t("import.results.noneImported")}
    </div>

    {/* Skipped wallets count */}
    {skippedWallets > 0 && <div className="summary-wallets-skipped">
      <Trans t={t} i18nKey="import.results.walletsSkipped" count={skippedWallets}>
        {{ count: skippedWallets }} wallet was skipped.
      </Trans>
    </div>}

    {/* TODO: Show contact counts too (only if >0) */}

    {/* Errors/warnings */}
    <div className="summary-errors-warnings">
      {warningCount > 0 && errorCount > 0
        ? (
          // Show errors and warnings
          <Trans t={t} i18nKey="import.results.errorsAndWarnings">
            There were
            <b className="errors">{{ errors: errorCount }} error(s)</b>
            and
            <b className="warnings">{{ warnings: warningCount }} warning(s)</b>
            while importing your backup.
          </Trans>
        )
        : (warningCount > 0
          ? (
            // Show just warnings
            <Trans t={t} i18nKey="import.results.warnings" count={warningCount}>
              There was
              <b className="warnings">{{ count: warningCount }} warning</b>
              while importing your backup.
            </Trans>
          )
          : (errorCount > 0
            ? (
              // Show just errors
              <Trans t={t} i18nKey="import.results.errors" count={errorCount}>
                There was
                <b className="errors">{{ count: errorCount }} error</b>
                while importing your backup.
              </Trans>
            )
            : <></>))}
    </div>
  </Paragraph>;
}

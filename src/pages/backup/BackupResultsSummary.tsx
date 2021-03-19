// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Typography } from "antd";

import { useTranslation, Trans } from "react-i18next";

import { BackupResults, ResultType } from "./backupResults";

import "./BackupResultsSummary.less";

const { Paragraph } = Typography;

function getMessageCountByType(
  results: BackupResults,
  type: ResultType
): number {
  let acc = 0;

  acc += Object.values(results.messages.wallets)
    .reduce((acc, r) => acc + r.messages.filter(m => m.type === type).length, 0);
  acc += Object.values(results.messages.contacts)
    .reduce((acc, r) => acc + r.messages.filter(m => m.type === type).length, 0);

  return acc;
}

/** Provides a paragraph summarising the results of the backup import (e.g. the
 * amount of wallets imported, the amount of errors, etc.). */
export function BackupResultsSummary({ results }: { results: BackupResults }): JSX.Element {
  const { t } = useTranslation();

  const { newWallets, skippedWallets, newContacts, skippedContacts } = results;
  const warningCount = getMessageCountByType(results, "warning");
  const errorCount = getMessageCountByType(results, "error");

  return <Paragraph className="backup-results-summary">
    {/* New wallets imported count */}
    <div className="summary-wallets-imported">
      {newWallets > 0
        ? (
          <Trans t={t} i18nKey="import.results.walletsImported" count={newWallets}>
            <span className="positive">{{ count: newWallets }} new wallet</span>
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

    {/* New contacts imported count */}
    {newContacts > 0 && <div className="summary-contacts-imported">
      <Trans t={t} i18nKey="import.results.contactsImported" count={newContacts}>
        <span className="positive">{{ count: newContacts }} new contact</span>
        was imported.
      </Trans>
    </div>}

    {/* Skipped contacts count */}
    {skippedContacts > 0 && <div className="summary-contacts-skipped">
      <Trans t={t} i18nKey="import.results.contactsSkipped" count={skippedContacts}>
        {{ count: skippedContacts }} contact was skipped.
      </Trans>
    </div>}

    {/* Errors */}
    {errorCount > 0 && <div className="summary-errors-warnings">
      <Trans t={t} i18nKey="import.results.errors" count={errorCount}>
        There was
        <b className="errors">{{ count: errorCount }} error</b>
        while importing your backup.
      </Trans>
    </div>}

    {/* Warnings */}
    {warningCount > 0 && <div className="summary-errors-warnings">
      <Trans t={t} i18nKey="import.results.warnings" count={warningCount}>
        There was
        <b className="warnings">{{ count: warningCount }} warning</b>
        while importing your backup.
      </Trans>
    </div>}
  </Paragraph>;
}

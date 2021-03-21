// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, Dispatch, SetStateAction } from "react";
import { Modal, Button } from "antd";

import { useTFns } from "@utils/i18n";

import { useImportBackupForm } from "./ImportBackupForm";
import { useImportProgress } from "./ImportProgress";
import { ImportFileButton } from "./ImportFileButton";
import { BackupResults } from "./backupResults";
import { BackupResultsSummary } from "./BackupResultsSummary";
import { BackupResultsTree } from "./BackupResultsTree";

import Debug from "debug";
const debug = Debug("kristweb:import-backup-modal");

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function ImportBackupModal({ visible, setVisible }: Props): JSX.Element {
  const tFns = useTFns("import.");
  const { t, tStr } = tFns;

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BackupResults>();

  const { progressBar, onProgress, initProgress, resetProgress }
    = useImportProgress(tFns);

  const { form, resetForm, triggerSubmit, setCode }
    = useImportBackupForm(setLoading, setResults, onProgress, initProgress);

  /** Resets all the state when the modal is closed. */
  function resetState() {
    resetForm();
    resetProgress();
    setLoading(false);
    setResults(undefined);
  }

  function closeModal() {
    // Don't allow closing the modal while importing
    if (loading) return;

    debug("closing modal and resetting fields");
    resetState();
    setVisible(false);
  }

  return <Modal
    title={tStr("modalTitle")}

    visible={visible}
    destroyOnClose

    // Grow the modal when there are results. This not only helps make it look
    // better, but also prevents the user from accidentally double clicking
    // the 'Import' button and immediately closing the results.
    width={results ? 640 : undefined}

    onCancel={closeModal}

    // Handle showing just an 'OK' button on the results screen, or all three
    // 'Import from file', 'Close', 'Import' buttons otherwise
    footer={results || loading
      ? (
        // "Close" button for results screen
        <Button key="close" onClick={closeModal}>
          {t("dialog.close")}
        </Button>
      )
      : <>
        {/* Import screen */}
        {/* "Import from file" button for import screen */}
        <ImportFileButton setCode={setCode} />

        {/* "Cancel" button for import screen */}
        <Button key="cancel" onClick={closeModal}>
          {t("dialog.cancel")}
        </Button>

        {/* "Import" button for import screen */}
        <Button
          key="import"
          type="primary"

          loading={loading}
          onClick={results ? closeModal : triggerSubmit}
        >
          {tStr("modalButton")}
        </Button>
      </>}
  >
    {/* Show the results screen, progress bar, or backup form */}
    {results
      ? <>
        <BackupResultsSummary results={results} />
        <BackupResultsTree results={results} />
      </>
      : (loading
        ? progressBar
        : form)}
  </Modal>;
}


// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { useLegacyMigrationForm } from "./LegacyMigrationForm";

import { BackupKristWebV1 } from "@pages/backup/backupFormats";
import { useImportProgress } from "@pages/backup/ImportProgress";
import { BackupResults } from "@pages/backup/backupResults";
import { BackupResultsSummary } from "@pages/backup/BackupResultsSummary";
import { BackupResultsTree } from "@pages/backup/BackupResultsTree";

import Debug from "debug";
const debug = Debug("kristweb:legacy-migration-modal");

interface Props {
  backup: BackupKristWebV1;
  setVisible: (visible: boolean) => void;
}

export function LegacyMigrationModal({
  backup,
  setVisible
}: Props): JSX.Element {
  const { t, tStr } = useTFns("legacyMigration.");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BackupResults>();

  const { progressBar, onProgress, initProgress } = useImportProgress();

  const { form, triggerSubmit } = useLegacyMigrationForm(
    setLoading, setResults, onProgress, initProgress, backup
  );

  function closeModal() {
    setVisible(false);
  }

  function openForgotPasswordModal() {
    Modal.confirm({
      title: tStr("forgotPassword.modalTitle"),
      icon: <ExclamationCircleOutlined />,

      content: tStr("forgotPassword.modalContent"),

      cancelText: t("dialog.cancel"),

      okText: tStr("forgotPassword.buttonSkip"),
      okType: "danger",
      onOk() {
        debug("skipping v1 legacy migration");

        // Mark the migration as completed, so the modal won't appear again.
        // The data will be deleted after 7 days.
        localStorage.setItem("migrated", "2");
        localStorage.setItem("legacyMigratedTime", new Date().toISOString());

        closeModal();
      }
    });
  }

  return <Modal
    title={tStr("modalTitle")}

    closable={!!results}
    visible={true}
    destroyOnClose

    width={results ? 640 : undefined}

    // Remove the 'Cancel' button
    footer={<>
      {/* Forgot password button */}
      {!loading && !results && <Button
        danger
        onClick={openForgotPasswordModal}
      >
        {tStr("buttonForgotPassword")}
      </Button>}

      {/* Submit button */}
      <Button
        type="primary"
        loading={loading}
        onClick={results ? closeModal : triggerSubmit}
      >
        {results ? t("dialog.close") : tStr("buttonSubmit")}
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

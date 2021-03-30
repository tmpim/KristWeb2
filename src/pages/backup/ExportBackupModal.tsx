// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { Modal, Button, Input } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

import { Trans } from "react-i18next";
import { useTFns } from "@utils/i18n";

import { useWallets } from "@wallets";

import { backupExport } from "./backupExport";
import { CopyInputButton } from "@comp/CopyInputButton";

import dayjs from "dayjs";
import { saveAs } from "file-saver";

import { criticalError } from "@utils";

interface Props {
  visible?: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function ExportBackupModal({
  visible,
  setVisible
}: Props): JSX.Element {
  const { t, tStr, tKey } = useTFns("export.");

  // The generated export code
  const [code, setCode] = useState("");
  const inputRef = useRef<Input>(null);

  // Used to auto-refresh the code if the wallets change
  const { wallets } = useWallets();

  // Generate the backup code
  useEffect(() => {
    // Don't bother generating if the modal isn't visible
    if (!visible) {
      setCode("");
      return;
    }

    backupExport()
      .then(setCode)
      .catch(criticalError);
  }, [visible, wallets]);

  function saveToFile() {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `KristWeb2-export-${dayjs().format("YYYY-MM-DD--HH-mm-ss")}.txt`);
    closeModal();
  }

  function closeModal() {
    setVisible(false);
    setCode("");
  }

  // Shows a formatted size for the backup code
  function Size() {
    return <b>{(code.length / 1024).toFixed(1)} KiB</b>;
  }

  return <Modal
    visible={visible}

    title={tStr("modalTitle")}
    className="export-backup-modal"

    // Add the custom buttons to the modal footer
    footer={<>
      {/* Close button */}
      <Button onClick={closeModal} style={{ float: "left" }}>
        {t("dialog.close")}
      </Button>

      {/* Copy to clipboard button */}
      <CopyInputButton targetInput={inputRef} content={tStr("buttonCopy")} />

      {/* Save to file button */}
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={saveToFile}
      >
        {tStr("buttonSave")}
      </Button>
    </>}

    onCancel={closeModal}
    destroyOnClose
  >
    {/* Description paragraph */}
    <p><Trans t={t} i18nKey={tKey("description")}>
      This secret code contains your wallets and address book contacts. You can
      use it to import them in another browser, or to back them up. You will
      still need your master password to import the wallets in the future.
      <b>Do not share this code with anyone.</b>
    </Trans></p>

    {/* Size calculation */}
    <p><Trans t={t} i18nKey={tKey("size")}>
      Size: <Size />
    </Trans></p>

    <Input.TextArea
      ref={inputRef}
      rows={5}
      readOnly
      value={code}
    />
  </Modal>;
}

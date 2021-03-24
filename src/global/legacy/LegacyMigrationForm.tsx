// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, Dispatch, SetStateAction} from "react";
import { Form, notification } from "antd";

import { Trans } from "react-i18next";
import { useTFns, translateError } from "@utils/i18n";

import { store } from "@app";

import { getMasterPasswordInput } from "@comp/auth/MasterPasswordInput";
import { setMasterPassword } from "@wallets";

import { BackupKristWebV1 } from "@pages/backup/backupFormats";
import { IncrProgressFn, InitProgressFn } from "@pages/backup/ImportProgress";
import { backupVerifyPassword, backupImport } from "@pages/backup/backupImport";
import { BackupResults } from "@pages/backup/backupResults";

import Debug from "debug";
const debug = Debug("kristweb:legacy-migration-form");

interface LegacyMigrationFormHookRes {
  form: JSX.Element;

  triggerSubmit: () => Promise<void>;
}

export function useLegacyMigrationForm(
  setLoading: Dispatch<SetStateAction<boolean>>,
  setResults: Dispatch<SetStateAction<BackupResults | undefined>>,

  onProgress: IncrProgressFn,
  initProgress: InitProgressFn,

  backup: BackupKristWebV1,
): LegacyMigrationFormHookRes {
  const { t, tStr, tKey } = useTFns("legacyMigration.");

  const [form] = Form.useForm();

  const [masterPasswordError, setMasterPasswordError] = useState<string>();

  async function onFinish() {
    const values = await form.validateFields();
    const { masterPassword } = values;
    if (!masterPassword) return;

    setLoading(true);

    try {
      // Attempt to verify the master password
      await backupVerifyPassword(backup, masterPassword);
      setMasterPasswordError(undefined);

      // Initialise the app's master password to this one, if it's not already
      // set up
      const hasMP = store.getState().masterPassword.hasMasterPassword;
      if (!hasMP) {
        debug("no existing master password, initialising with provided one");
        await setMasterPassword(values.masterPassword);
      }

      // Perform the import
      const results = await backupImport(
        backup, masterPassword, false,
        onProgress, initProgress
      );

      // Mark the legacy migration as performed, so the modal doesn't appear
      // again. Also store the date, so the old data can be removed after an
      // appropriate amount of time has passed.
      localStorage.setItem("migrated", "2");
      localStorage.setItem("legacyMigratedTime", new Date().toISOString());

      setResults(results);
    } catch (err) {
      if (err.message === "import.masterPasswordRequired"
        || err.message === "import.masterPasswordIncorrect") {
        // Master password incorrect error
        setMasterPasswordError(translateError(t, err));
      } else {
        // Any other import error
        console.error(err);
        notification.error({ message: tStr("errorUnknown") });
      }
    } finally {
      setLoading(false);
    }
  }

  const formEl = <Form
    form={form}
    layout="vertical"

    name="legacyMigrationForm"

    initialValues={{ masterPassword: "" }}

    onFinish={onFinish}
  >
    {/* Description */}
    <p><Trans t={t} i18nKey={tKey("description")}></Trans></p>

    {/* Password input */}
    <Form.Item
      name="masterPassword"
      rules={[
        { required: true, message: tStr("errorPasswordRequired") },
        { min: 0, message: tStr("errorPasswordRequired") },
      ]}
      style={{ marginBottom: 8 }}

      // Show the master password error here, if present
      validateStatus={masterPasswordError ? "error" : undefined}
      help={masterPasswordError || undefined}
    >
      {getMasterPasswordInput({
        placeholder: tStr("masterPasswordPlaceholder"),
        autoFocus: true
      })}
    </Form.Item>
  </Form>;

  return {
    form: formEl,
    triggerSubmit: onFinish
  };
}

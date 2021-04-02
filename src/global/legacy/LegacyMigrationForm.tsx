// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, Dispatch, SetStateAction} from "react";
import { Form, notification } from "antd";

import { Trans } from "react-i18next";
import { useTFns, translateError } from "@utils/i18n";

import { store } from "@app";

import { getMasterPasswordInput } from "@comp/auth/MasterPasswordInput";
import { useAuth } from "@comp/auth/AuthorisedAction";
import { setMasterPassword } from "@wallets";

import { BackupKristWebV1 } from "@pages/backup/backupFormats";
import { IncrProgressFn, InitProgressFn } from "@pages/backup/ImportProgress";
import { backupVerifyPassword, backupImport } from "@pages/backup/backupImport";
import { BackupResults } from "@pages/backup/backupResults";

import { criticalError } from "@utils";

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
  const promptAuth = useAuth();

  const [masterPasswordError, setMasterPasswordError] = useState<string>();

  const foundWalletCount = Object.keys(backup.wallets).length;
  const foundContactCount = Object.keys(backup.friends).length;

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
        await setMasterPassword(masterPassword);
        await beginImport(masterPassword);
      } else {
        // A master password is already set up. In case they are different, the
        // old wallets will need to be re-encrypted with the new password. The
        // backupImport function grabs the master password from the store, so we
        // must prompt for auth first before continuing.
        debug("existing master password, prompting for auth");
        promptAuth(true, () => beginImport(masterPassword));
      }
    } catch (err) {
      debug("legacy migration error block 1");
      console.error(err);
      if (err.message === "import.masterPasswordRequired"
        || err.message === "import.masterPasswordIncorrect") {
        // Master password incorrect error
        setMasterPasswordError(translateError(t, err));
      } else {
        // Any other import error
        criticalError(err);
        notification.error({ message: tStr("errorUnknown") });
      }

      setLoading(false);
    }
  }

  async function beginImport(masterPassword: string) {
    try {
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
      debug("legacy migration error block 2");
      criticalError(err);
      notification.error({ message: tStr("errorUnknown") });
    } finally {
      debug("finally setLoading false");
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
    <p>
      <Trans t={t} i18nKey={tKey("description")}></Trans>
    </p>

    {/* Found wallet and contact count */}
    {foundWalletCount > 0 && <p className="text-green">
      <Trans t={t} i18nKey={tKey("walletCount")} count={foundWalletCount}>
        Detected <b>{{ count: foundWalletCount }}</b> wallets
      </Trans>
    </p>}
    {foundContactCount > 0 && <p className="text-green">
      <Trans t={t} i18nKey={tKey("contactCount")} count={foundContactCount}>
        Detected <b>{{ count: foundContactCount }}</b> contacts
      </Trans>
    </p>}

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

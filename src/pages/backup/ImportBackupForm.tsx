// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, Dispatch, SetStateAction } from "react";
import { Form, Input, Checkbox, Typography } from "antd";

import { useTFns, translateError } from "@utils/i18n";

import { getMasterPasswordInput } from "@comp/auth/MasterPasswordInput";

import { useBooleanSetting, setBooleanSetting } from "@utils/settings";

import { ImportDetectFormat } from "./ImportDetectFormat";
import { IncrProgressFn, InitProgressFn } from "./ImportProgress";
import { decodeBackup } from "./backupParser";
import { backupVerifyPassword, backupImport } from "./backupImport";
import { BackupResults } from "./backupResults";

import Debug from "debug";
const debug = Debug("kristweb:import-backup-modal");

const { Paragraph } = Typography;
const { TextArea } = Input;

interface FormValues {
  masterPassword: string;
  code: string;
  overwrite: boolean;
}

interface ImportBackupFormHookRes {
  form: JSX.Element;

  resetForm: () => void;
  triggerSubmit: () => Promise<void>;

  setCode: (code: string) => void;
}

export function useImportBackupForm(
  setLoading: Dispatch<SetStateAction<boolean>>,
  setResults: Dispatch<SetStateAction<BackupResults | undefined>>,

  onProgress: IncrProgressFn,
  initProgress: InitProgressFn
): ImportBackupFormHookRes {
  const { t, tStr, tKey } = useTFns("import.");

  const [form] = Form.useForm<FormValues>();

  const [code, setCode] = useState("");
  const [decodeError, setDecodeError] = useState<string>();
  const [masterPasswordError, setMasterPasswordError] = useState<string>();

  const importOverwrite = useBooleanSetting("importOverwrite");

  function resetForm() {
    form.resetFields();
    setCode("");
    setDecodeError("");
    setMasterPasswordError("");
  }

  function onValuesChange(changed: Partial<FormValues>) {
    if (changed.code) setCode(changed.code);

    // Remember the value of the 'overwrite' checkbox
    if (changed.overwrite !== undefined) {
      debug("updating importOverwrite to %b", changed.overwrite);
      setBooleanSetting("importOverwrite", changed.overwrite, false);
    }
  }

  // Detect the backup format for the final time, validate the password, and
  // if all is well, begin the import
  async function onFinish() {
    const values = await form.validateFields();

    const { masterPassword, code, overwrite } = values;
    if (!masterPassword || !code) return;

    setLoading(true);

    try {
      // Decode first
      const backup = decodeBackup(code);
      debug("detected format: %s", backup.type);
      setDecodeError(undefined);

      // Attempt to verify the master password
      await backupVerifyPassword(backup, masterPassword);
      setMasterPasswordError(undefined);

      // Perform the import
      const results = await backupImport(
        backup, masterPassword, !overwrite,
        onProgress, initProgress
      );

      setResults(results);
    } catch (err) {
      if (err.message === "import.masterPasswordRequired"
        || err.message === "import.masterPasswordIncorrect") {
        // Master password incorrect error
        setMasterPasswordError(translateError(t, err));
      } else {
        // Any other decoding error
        console.error(err);
        setDecodeError(translateError(t, err, tKey("decodeErrors.unknown")));
      }
    } finally {
      setLoading(false);
    }
  }

  const formEl = <Form
    form={form}
    layout="vertical"

    name="importBackupForm"

    initialValues={{
      masterPassword: "",
      code: "",
      overwrite: importOverwrite
    }}

    onValuesChange={onValuesChange}
    onFinish={onFinish}
  >
    {/* Import lead */}
    <Paragraph>{tStr("description")}</Paragraph>

    {/* Detected format information */}
    <ImportDetectFormat
      code={code}
      setDecodeError={setDecodeError}
    />

    {/* Password input */}
    <Form.Item
      name="masterPassword"
      rules={[
        { required: true, message: tStr("masterPasswordRequired") },
        { min: 0, message: tStr("masterPasswordRequired") },
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

    {/* Code textarea */}
    <Form.Item
      name="code"
      rules={[
        { required: true, message: tStr("textareaRequired") },
        { min: 0, message: tStr("textareaRequired") },
      ]}

      // Show the decode error here, if present
      validateStatus={decodeError ? "error" : undefined}
      help={decodeError || undefined}
    >
      <TextArea
        rows={4}
        autoSize={{ minRows: 4, maxRows: 4 }}
        placeholder={tStr("textareaPlaceholder")}
      />
    </Form.Item>

    {/* Overwrite checkbox */}
    <Form.Item
      name="overwrite"
      valuePropName="checked"
      style={{ marginBottom: 0 }}
    >
      <Checkbox>
        {tStr("overwriteCheckboxLabel")}
      </Checkbox>
    </Form.Item>
  </Form>;

  return {
    form: formEl,

    resetForm,
    triggerSubmit: onFinish,

    setCode(code) {
      setCode(code); // Triggers a format re-detection
      form.setFieldsValue({ code });
    }
  };
}

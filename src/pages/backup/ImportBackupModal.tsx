// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, Dispatch, SetStateAction } from "react";
import { Modal, Form, FormInstance, Input, Checkbox, Button, Typography, notification } from "antd";

import { useTranslation } from "react-i18next";
import { translateError } from "@utils/i18n";

import { getMasterPasswordInput } from "@comp/auth/MasterPasswordInput";

import { useBooleanSetting, setBooleanSetting } from "@utils/settings";

import { ImportDetectFormat } from "./ImportDetectFormat";
import { decodeBackup } from "./backupParser";
import { backupVerifyPassword, backupImport } from "./backupImport";
import { BackupResults } from "./backupResults";
import { BackupResultsSummary } from "./BackupResultsSummary";
import { BackupResultsTree } from "./BackupResultsTree";

import Debug from "debug";
const debug = Debug("kristweb:import-backup-modal");

const { Paragraph } = Typography;
const { TextArea } = Input;

interface FormValues {
  masterPassword: string;
  code: string;
  overwrite: boolean;
}

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function ImportBackupModal({ visible, setVisible }: Props): JSX.Element {
  const { t } = useTranslation();

  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [decodeError, setDecodeError] = useState<string>();
  const [masterPasswordError, setMasterPasswordError] = useState<string>();
  const [results, setResults] = useState<BackupResults>();

  /** Resets all the state when the modal is closed. */
  function resetState() {
    form.resetFields();
    setLoading(false);
    setCode("");
    setDecodeError("");
    setMasterPasswordError("");
    setResults(undefined);
  }

  function closeModal() {
    // Don't allow closing the modal while importing
    if (loading) return;

    debug("closing modal and resetting fields");
    resetState();
    setVisible(false);
  }

  function onValuesChange(changed: Partial<FormValues>) {
    if (changed.code) setCode(changed.code);

    // Remember the value of the 'overwrite' checkbox
    if (changed.overwrite !== undefined) {
      debug("updating importOverwrite to %b", changed.overwrite);
      setBooleanSetting("importOverwrite", changed.overwrite, false);
    }
  }

  /** Updates the contents of the 'code' field with the given file. */
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { files } = e.target;
    if (!files?.[0]) return;
    const file = files[0];

    debug("importing file %s", file.name);

    // Disallow non-plaintext files
    if (file.type !== "text/plain") {
      notification.error({
        message: t("import.fileErrorTitle"),
        description: t("import.fileErrorNotText")
      });
      return;
    }

    // Read the file and update the contents of the code field
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = e => {
      if (!e.target || !e.target.result) {
        debug("reader.onload target was null?!", e);
        return;
      }

      const contents = e.target.result.toString();
      // debug("got file contents: %s", contents);

      // Update the form
      setCode(contents); // Triggers a format re-detection
      form.setFieldsValue({ code: contents });
    };
  }

  // Detect the backup format for the final time, validate the password, and
  // if all is well, begin the import
  async function onFinish() {
    // If we're already on the results screen, close the modal instead
    if (results) return closeModal();

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
      const results = await backupImport(backup, masterPassword, !overwrite);
      setResults(results);
    } catch (err) {
      if (err.message === "import.masterPasswordRequired"
        || err.message === "import.masterPasswordIncorrect") {
        // Master password incorrect error
        setMasterPasswordError(translateError(t, err));
      } else {
        // Any other decoding error
        console.error(err);
        setDecodeError(translateError(t, err, "import.decodeErrors.unknown"));
      }
    } finally {
      setLoading(false);
    }
  }

  return <Modal
    title={t("import.modalTitle")}

    visible={visible}
    destroyOnClose

    // Grow the modal when there are results. This not only helps make it look
    // better, but also prevents the user from accidentally double clicking
    // the 'Import' button and immediately closing the results.
    width={results ? 640 : undefined}

    onCancel={closeModal}

    // Handle showing just an 'OK' button on the results screen, or all three
    // 'Import from file', 'Close', 'Import' buttons otherwise
    footer={results
      ? [ // Results screen
        // "Close" button for results screen
        <Button key="close" onClick={closeModal}>
          {t("dialog.close")}
        </Button>
      ]
      : [ // Import screen
        // "Import from file" button for import screen
        <div key="importFromFile" style={{ float: "left" }}>
          {/* Pretend to be an ant-design button (for some reason, nesting a
            * Button in a label just wouldn't work) */}
          <label htmlFor="import-backup-file" className="ant-btn">
            {/* I have no idea why verticalAlign has to be specified here */}
            <span style={{ verticalAlign: "middle" }}>
              {t("import.fromFileButton")}
            </span>
          </label>

          {/* ant-design's Upload/rc-upload was over 24 kB for this, and we
            * only use it for the most trivial functionality, so may as well
            * just use a bare component. It's okay that this input will
            * probably get re-rendered (and thus lose its value) every time
            * the state changes, as we only use it to update `code`'s state
            * immediately after a file is picked. */}
          <input
            id="import-backup-file"
            type="file"
            accept="text/plain"
            onChange={onFileChange}
            style={{ display: "none" }}
          />
        </div>,

        // "Cancel" button for import screen
        <Button key="cancel" onClick={closeModal}>
          {t("dialog.cancel")}
        </Button>,

        // "Import" button for import screen
        <Button
          key="import"
          type="primary"

          loading={loading}
          onClick={onFinish}
        >
          {t("import.modalButton")}
        </Button>
      ]}
  >
    {results
      ? <>
        {/* Got results - show them */}
        <BackupResultsSummary results={results} />
        <BackupResultsTree results={results} />
      </>
      : (
        // No results - show the import form
        <ImportBackupForm
          form={form}

          code={code}
          decodeError={decodeError}
          setDecodeError={setDecodeError}
          masterPasswordError={masterPasswordError}

          onValuesChange={onValuesChange}
          onFinish={onFinish}
        />
      )}
  </Modal>;
}

interface FormProps {
  form: FormInstance<FormValues>;

  code: string;
  decodeError?: string;
  setDecodeError: Dispatch<SetStateAction<string | undefined>>;
  masterPasswordError?: string;

  onValuesChange: (changed: Partial<FormValues>) => void;
  onFinish: () => void;
}

function ImportBackupForm({ form, code, decodeError, setDecodeError, masterPasswordError, onValuesChange, onFinish }: FormProps): JSX.Element {
  const { t } = useTranslation();

  const importOverwrite = useBooleanSetting("importOverwrite");

  return <Form
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
    <Paragraph>{t("import.description")}</Paragraph>

    {/* Detected format information */}
    <ImportDetectFormat
      code={code}
      setDecodeError={setDecodeError}
    />

    {/* Password input */}
    <Form.Item
      name="masterPassword"
      rules={[
        { required: true, message: t("import.masterPasswordRequired") },
        { min: 0, message: t("import.masterPasswordRequired") },
      ]}
      style={{ marginBottom: 8 }}

      // Show the master password error here, if present
      validateStatus={masterPasswordError ? "error" : undefined}
      help={masterPasswordError || undefined}
    >
      {getMasterPasswordInput({
        placeholder: t("import.masterPasswordPlaceholder"),
        autoFocus: true
      })}
    </Form.Item>

    {/* Code textarea */}
    <Form.Item
      name="code"
      rules={[
        { required: true, message: t("import.textareaRequired") },
        { min: 0, message: t("import.textareaRequired") },
      ]}

      // Show the decode error here, if present
      validateStatus={decodeError ? "error" : undefined}
      help={decodeError || undefined}
    >
      <TextArea
        rows={4}
        autoSize={{ minRows: 4, maxRows: 4 }}
        placeholder={t("import.textareaPlaceholder")}
      />
    </Form.Item>

    {/* Overwrite checkbox */}
    <Form.Item
      name="overwrite"
      valuePropName="checked"
      style={{ marginBottom: 0 }}
    >
      <Checkbox>
        {t("import.overwriteCheckboxLabel")}
      </Checkbox>
    </Form.Item>
  </Form>;
}

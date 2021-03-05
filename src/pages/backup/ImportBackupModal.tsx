// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, Dispatch, SetStateAction} from "react";
import { Modal, Form, Input, Button, Typography } from "antd";

import { useTranslation, Trans } from "react-i18next";
import { translateError } from "@utils/i18n";

import { FakeUsernameInput } from "@comp/auth/FakeUsernameInput";
import { getMasterPasswordInput } from "@comp/auth/MasterPasswordInput";

import { ImportDetectFormat } from "./ImportDetectFormat";
import { detectBackupFormat } from "../backup/backupParser";

import Debug from "debug";
const debug = Debug("kristweb:import-backup-modal");

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface FormValues {
  masterPassword: string;
  code: string;
}

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

export function ImportBackupModal({ visible, setVisible }: Props): JSX.Element {
  const { t } = useTranslation();

  const [form] = Form.useForm<FormValues>();
  const [code, setCode] = useState("");
  const [decodeError, setDecodeError] = useState<string | undefined>();

  function closeModal() {
    debug("closing modal and resetting fields");
    form.resetFields();
    setCode("");
    setVisible(false);
  }

  function onValuesChange(changed: Partial<FormValues>) {
    if (changed.code) setCode(changed.code);
  }

  // Detect the backup format for the final time, validate the password, and
  // if all is well, begin the import
  async function onFinish() {
    const values = await form.validateFields();
    if (!values.masterPassword || !values.code) return;

    try {
      // Decode first
      const format = detectBackupFormat(code);
      debug("detected format: %s", format.type);

      setDecodeError(undefined);
    } catch (err) {
      console.error(err);
      setDecodeError(translateError(t, err, "import.decodeErrors.unknown"));
    }
  }

  return <Modal
    title={t("import.modalTitle")}
    okText={t("import.modalButton")}
    cancelText={t("dialog.cancel")}

    visible={visible}
    destroyOnClose

    onCancel={closeModal}
    onOk={onFinish}
  >
    <Form
      form={form}
      layout="vertical"

      name={"importBackupForm"}

      initialValues={{
        masterPassword: "",
        code: ""
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
        help={decodeError}
      >
        <TextArea
          rows={4}
          autoSize={{ minRows: 4, maxRows: 4 }}
          placeholder={t("import.textareaPlaceholder")}
        />
      </Form.Item>
    </Form>
  </Modal>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useCallback, useState } from "react";
import { Form, Input, Checkbox } from "antd";

import { useTFns } from "@utils/i18n";

import { AddressPicker } from "@comp/addresses/picker/AddressPicker";
import { AmountInput } from "@comp/transactions/AmountInput";
import { SmallCopyable } from "@comp/SmallCopyable";

import { METADATA_REGEXP } from "../send/SendTransactionForm";

interface FormValues {
  to: string;

  hasAmount: boolean;
  amount?: number;

  hasMetadata: boolean;
  metadata?: string;
}

export function RequestForm(): JSX.Element {
  const { t, tStr } = useTFns("request.");

  const [form] = Form.useForm<FormValues>();

  const [to, setTo] = useState("");
  const [hasAmount, setHasAmount] = useState(false);
  const [hasMetadata, setHasMetadata] = useState(false);

  const [generatedLink, setGeneratedLink] = useState<string>();

  const generateLink = useCallback((values: Partial<FormValues>) => {
    const [scheme,, href] = window.location.href.split("/");
    const baseURL = scheme + "//" + href;

    if (!values || !values.to) {
      setGeneratedLink(undefined);
      return;
    }

    const query = new URLSearchParams();
    query.set("to", values.to);

    // Add the amount if requested
    if (values.hasAmount && values.amount)
      query.set("amount", values.amount.toString());

    // Add the metadata if requested
    if (values.hasMetadata && values.metadata)
      query.set("metadata", values.metadata);

    setGeneratedLink(baseURL + "/send?" + query.toString());
  }, []);

  async function onValuesChange(_: unknown, values: Partial<FormValues>) {
    setTo(values.to || "");
    setHasAmount(!!values.hasAmount);
    setHasMetadata(!!values.hasMetadata);

    generateLink(values);
  }

  return <Form
    form={form}
    layout="vertical"
    className="request-form"

    name="request"

    onValuesChange={onValuesChange}
  >
    {/* Request recipient */}
    <AddressPicker
      form={form}
      name="to"
      label={tStr("labelTo")}
      value={to}
      tabIndex={1}
    />

    {/* Request amount */}
    <AmountInput
      setAmount={amount => form.setFieldsValue({ amount })}

      label={<>
        {/* Has amount checkbox */}
        <Form.Item name="hasAmount" valuePropName="checked" className="cb">
          <Checkbox />
        </Form.Item>

        {tStr("labelAmount")}
      </>}

      disabled={!hasAmount}
      required={hasAmount}

      tabIndex={2}
    />

    {/* Request metadata */}
    <Form.Item
      name="metadata"
      label={<>
        {/* Has metadata checkbox */}
        <Form.Item name="hasMetadata" valuePropName="checked" className="cb">
          <Checkbox />
        </Form.Item>

        {tStr("labelMetadata")}
      </>}

      rules={[
        { max: 255, message: t("sendTransaction.errorMetadataTooLong") },
        { pattern: METADATA_REGEXP,
          message: t("sendTransaction.errorMetadataInvalid") },
      ]}
    >
      <Input.TextArea
        className="input-monospace"
        rows={3}
        placeholder={tStr("placeholderMetadata")}
        tabIndex={3}
        disabled={!hasMetadata}
      />
    </Form.Item>

    {/* Generated link */}
    <Form.Item
      label={<>
        {tStr("generatedLink")}

        {/* Show a copy button if there's a link */}
        {generatedLink && <SmallCopyable text={generatedLink} />}
      </>}

      style={{ marginBottom: 0 }}
    >
      <Input.TextArea
        className="input-monospace"
        rows={2}
        placeholder={tStr("generatedLink")}
        readOnly
        value={generatedLink}
      />
    </Form.Item>
  </Form>;
}

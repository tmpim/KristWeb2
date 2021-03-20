// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Form, Input } from "antd";

import { useTranslation } from "react-i18next";

const A_RECORD_REGEXP = /^[^\s.?#].[^\s]*/;

export function ARecordInput(): JSX.Element {
  const { t } = useTranslation();

  return <Form.Item
    name="aRecord"
    label={t("nameUpdate.labelARecord")}

    validateFirst
    rules={[{
      async validator(_, value) {
        if (!value) return;
        if (!A_RECORD_REGEXP.test(value) || value.length > 255)
          throw t("nameUpdate.errorParameterARecord");
      }
    }]}
  >
    <Input
      placeholder={t("nameUpdate.placeholderARecord")}
      allowClear
      maxLength={255}
    />
  </Form.Item>;
}

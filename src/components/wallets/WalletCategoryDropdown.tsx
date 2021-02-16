import React, { useState } from "react";
import { Select, Input, Button, Typography, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

const { Text } = Typography;

interface Props {
  onNewCategory?: (name: string) => void;
}

export function getWalletCategoryDropdown({ onNewCategory }: Props): JSX.Element {
  const { t } = useTranslation();
  const [input, setInput] = useState<string | undefined>();
  const [categories, setCategories] = useState<string[]>(["Test category"]);

  function addCategory() {
    if (!input) return;

    const categoryName = input.trim();
    if (!categoryName || categoryName.length > 32
      || categories.includes(categoryName)) return;

    const newCategories = [...categories, categoryName];
    newCategories.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));

    setCategories(newCategories);
    setInput(undefined);

    // TODO: fix bug where hitting enter will _sometimes_ not set the right
    //       category name on the form

    if (onNewCategory) onNewCategory(categoryName);
  }

  return <Select dropdownRender={menu => (
    <div>
      {menu}

      <Divider style={{ margin: "4px 0" }} />

      <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap", padding: "8px 12px" }}>
        <Input.Group compact style={{ display: "flex" }}>
          <Input
            value={input}

            maxLength={32}
            onChange={e => setInput(e.target.value)}
            onPressEnter={e => { e.preventDefault(); addCategory(); }}

            placeholder={t("addWallet.walletCategoryDropdownNewPlaceholder")}

            size="small"
            style={{ flex: 1, height: 24 }}
          />

          <Button size="small" icon={<PlusOutlined />} onClick={addCategory}>
            {t("addWallet.walletCategoryDropdownNew")}
          </Button>
        </Input.Group>
      </div>
    </div>)
  }>
    <Select.Option value="">
      <Text type="secondary">{t("addWallet.walletCategoryDropdownNone")}</Text>
    </Select.Option>

    {categories.map(c => <Select.Option key={c} value={c}>
      {c}
    </Select.Option>)}
  </Select>;
}

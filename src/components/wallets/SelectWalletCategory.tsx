// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC, useState, useMemo } from "react";
import { Select, Input, Button, Typography, Divider } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { localeSort } from "@utils";
import { useWallets } from "@wallets";

const { Text } = Typography;

interface Props {
  onNewCategory?: (name: string) => void;
}

export const SelectWalletCategory: FC<Props> = ({ onNewCategory, ...props }): JSX.Element => {
  const { t } = useTranslation();
  const [customCategory, setCustomCategory] = useState<string>();

  // Required to fetch existing categories
  const { wallets } = useWallets();
  const categories = useMemo(() => {
    // Get all the non-empty wallet categories and deduplicate them
    const categorySet = new Set(Object.values(wallets)
      .filter(w => w.category !== undefined && w.category !== "")
      .map(w => w.category) as string[]);

    // Add the custom category, if it exists, to our set of categories
    if (customCategory) categorySet.add(customCategory);

    // Convert the categories to an array and sort in a human-readable manner
    const cats = [...categorySet];
    localeSort(cats);
    return cats;
  }, [wallets, customCategory]);

  /** Adds a category. Returns whether or not the category input should be
   * wiped (i.e. whether or not it was added successfully). */
  function addCategory(input?: string): boolean {
    // Ignore invalid category names. Don't wipe the input.
    const categoryName = input?.trim();
    if (!categoryName
      || categoryName.length > 32
      || categories.includes(categoryName))
      return false;

    setCustomCategory(categoryName);

    // FIXME: hitting enter will _sometimes_ not set the right category name on
    //        the form
    if (onNewCategory) onNewCategory(categoryName);

    return true;
  }

  return <Select
    // Inherit the props from the parent, so that Form.Item works properly
    {...props}

    dropdownRender={menu => (
      <div>
        {/* The category select options */}
        {menu}

        <Divider style={{ margin: "4px 0" }} />

        {/* The textbox/button to add a new category */}
        <AddCategoryInput addCategory={addCategory} />
      </div>)
    }
  >
    {/* "No category" option */}
    <Select.Option value="">
      <Text type="secondary">{t("addWallet.walletCategoryDropdownNone")}</Text>
    </Select.Option>

    {/* Render each category as an option */}
    {categories.map(c => (
      <Select.Option key={c} value={c}>
        {c}
      </Select.Option>
    ))}
  </Select>;
};

interface AddCategoryInputProps {
  addCategory: (input: string | undefined) => boolean;
}

/** The textbox/button to input and add a new category. */
function AddCategoryInput({ addCategory }: AddCategoryInputProps): JSX.Element {
  const { t } = useTranslation();
  const [input, setInput] = useState<string | undefined>();

  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap", padding: "8px 12px" }}>
      <Input.Group compact style={{ display: "flex" }}>
        <Input
          value={input}

          maxLength={32}
          onChange={e => setInput(e.target.value)}
          onPressEnter={e => {
            e.preventDefault();

            // Wipe the input if the category was added successfully
            if (addCategory(input)) setInput(undefined);
          }}

          placeholder={t("addWallet.walletCategoryDropdownNewPlaceholder")}

          size="small"
          style={{ flex: 1, height: 24 }}
        />

        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={() => {
            // Wipe the input if the category was added successfully
            if (addCategory(input)) setInput(undefined);
          }}
        >
          {t("addWallet.walletCategoryDropdownNew")}
        </Button>
      </Input.Group>
    </div>
  );
}

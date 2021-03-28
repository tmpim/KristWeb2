// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Modal, Form, Button, Select, Radio } from "antd";

import { useTFns } from "@utils/i18n";

import { LookupFilterOptionsBase } from "./table";

export interface SortConfig<FieldsT extends string> {
  sortKey: FieldsT;
  i18nKey: string;
}
export type SortOptions<FieldsT extends string> = SortConfig<FieldsT>[];

interface FormValues<FieldsT extends string> {
  orderBy: FieldsT;
  order: "ASC" | "DESC";
}

interface Props<FieldsT extends string> {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;

  sortOptions: SortOptions<FieldsT>;
  defaultOrderBy: FieldsT;
  defaultOrder: "ASC" | "DESC";

  options: LookupFilterOptionsBase<FieldsT>;
  setOptions: (opts: LookupFilterOptionsBase<FieldsT>) => void;
}

export function SortModal<FieldsT extends string>({
  visible,
  setVisible,

  sortOptions,
  defaultOrderBy,
  defaultOrder,

  options,
  setOptions
}: Props<FieldsT>): JSX.Element {
  const { t, tStr } = useTFns("sortModal.");

  const [form] = Form.useForm<FormValues<FieldsT>>();

  async function onSubmit() {
    const values = await form.validateFields();
    console.log(values);
    setOptions({
      ...options,
      orderBy: values.orderBy,
      order: values.order
    });
    closeModal();
  }

  function onReset() {
    setOptions({
      ...options,
      orderBy: defaultOrderBy,
      order: defaultOrder
    });
    closeModal();
  }

  function closeModal() {
    form.resetFields();
    setVisible(false);
  }

  // Update the form values if the table is sorted
  useEffect(() => {
    if (!form || !options) return;
    form.setFieldsValue({
      orderBy: options.orderBy || defaultOrderBy,
      order: options.order || defaultOrder
    } as any);
  }, [form, options, defaultOrderBy, defaultOrder]);

  return <Modal
    visible={visible}

    title={tStr("title")}

    onCancel={closeModal}
    destroyOnClose

    footer={<>
      {/* Reset */}
      <Button onClick={onReset} style={{ float: "left" }}>
        {tStr("buttonReset")}
      </Button>

      {/* Cancel */}
      <Button onClick={closeModal}>
        {t("dialog.cancel")}
      </Button>

      {/* Submit */}
      <Button type="primary" onClick={onSubmit}>
        {t("dialog.ok")}
      </Button>
    </>}
  >
    <Form<FormValues<FieldsT>>
      form={form}
      initialValues={{
        sortBy: options.orderBy,
        sortOrder: options.order
      }}

      onFinish={onSubmit}
    >
      {/* Sort by */}
      <Form.Item name="orderBy" label={tStr("sortBy")}>
        {/* Present each available sort option as a field */}
        <Select>
          {sortOptions.map(opt => (
            <Select.Option key={opt.sortKey} value={opt.sortKey}>
              {tStr("options." + opt.i18nKey)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Sort order (ascending, descending) */}
      <Form.Item name="order" label={tStr("sortOrder")}>
        <Radio.Group buttonStyle="solid">
          <Radio.Button value="ASC">{tStr("sortAscending")}</Radio.Button>
          <Radio.Button value="DESC">{tStr("sortDescending")}</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </Form>
  </Modal>;
}

export type OpenSortModalFn = (() => void)[];
export type SetOpenSortModalFn = (fn: OpenSortModalFn | undefined) => void;

export function useSortModal<FieldsT extends string>(
  sortOptions: SortOptions<FieldsT>,
  defaultOrderBy: FieldsT,
  defaultOrder: "ASC" | "DESC",

  options: LookupFilterOptionsBase<FieldsT>,
  setOptions: (opts: LookupFilterOptionsBase<FieldsT>) => void,
  setOpenSortModal?: SetOpenSortModalFn
): JSX.Element {
  const [visible, setVisible] = useState(false);
  useEffect(() => setOpenSortModal?.([() => setVisible(true)]), [setOpenSortModal]);

  return <SortModal
    visible={visible}
    setVisible={setVisible}

    sortOptions={sortOptions}
    defaultOrderBy={defaultOrderBy}
    defaultOrder={defaultOrder}

    options={options}
    setOptions={setOptions}
  />;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Modal, Form, Input, message, notification } from "antd";

import { useTFns } from "@utils/i18n";

import { ADDRESS_LIST_LIMIT } from "@wallets";
import { Contact, useContacts, addContact, editContact } from "@contacts";
import { useAddressPrefix, useNameSuffix, getNameParts } from "@utils/currency";

import { AddressPicker } from "@comp/addresses/picker/AddressPicker";

interface FormValues {
  label?: string;
  address: string;
}

interface Props {
  editing?: Contact;

  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AddContactModal({
  editing,

  visible,
  setVisible
}: Props): JSX.Element {
  const { t, tStr } = useTFns("addContact.");

  const [form] = Form.useForm<FormValues>();
  const [address, setAddress] = useState("");

  // Required to check for existing contacts
  const { contacts, contactAddressMap } = useContacts();
  const addressPrefix = useAddressPrefix();
  const nameSuffix = useNameSuffix();

  function closeModal() {
    setVisible(false);
    form.resetFields();
    setAddress("");
  }

  async function onSubmit() {
    const values = await form.validateFields();
    if (!values.address) return;

    const { label, address } = values;
    const isName = !!getNameParts(nameSuffix, address);

    if (editing) { // Edit contact
      // Double check the destination contact exists
      if (!contacts[editing.id]) return notification.error({
        message: tStr("errorMissingContactTitle"),
        description: tStr("errorMissingContactDescription")
      });

      // If the address changed, check that a contact doesn't already exist
      // with this address
      if (editing.address !== address && !!contactAddressMap[address]) {
        return notification.error({
          message: tStr("errorDuplicateContactTitle"),
          description: tStr("errorDuplicateContactDescription")
        });
      }

      // Perform the edit
      editContact(editing, { label, address, isName });
      message.success(tStr("messageSuccessEdit"));

      closeModal();
    } else { // Add contact
      // Check if we reached the contact limit
      if (Object.keys(contacts).length >= ADDRESS_LIST_LIMIT) {
        return notification.error({
          message: tStr("errorContactLimitTitle"),
          description: tStr("errorContactLimitDescription")
        });
      }

      // Check if the contact already exists
      if (contactAddressMap[address]) {
        return notification.error({
          message: tStr("errorDuplicateContactTitle"),
          description: tStr("errorDuplicateContactDescription")
        });
      }

      // Add the contact
      addContact({ label, address, isName });
      message.success(tStr("messageSuccessAdd"));

      closeModal();
    }
  }

  function onValuesChange(_: unknown, values: Partial<FormValues>) {
    setAddress(values.address || "");
  }

  return <Modal
    visible={visible}

    title={tStr(editing ? "modalTitleEdit" : "modalTitle")}

    okText={tStr(editing ? "buttonSubmitEdit" : "buttonSubmit")}
    onOk={onSubmit}

    cancelText={t("dialog.cancel")}
    onCancel={closeModal}
    destroyOnClose
  >
    <Form
      form={form}
      layout="vertical"

      name={editing ? "editContactForm" : "addContactForm"}

      initialValues={{
        label: editing?.label ?? undefined,
        address: editing?.address ?? undefined
      }}

      onValuesChange={onValuesChange}
      onFinish={onSubmit}
    >
      {/* Contact label */}
      <Form.Item
        name="label"
        label={tStr("contactLabel")}
        rules={[
          { max: 32, message: tStr("contactLabelMaxLengthError") },
          { whitespace: true, message: tStr("contactLabelWhitespaceError") }
        ]}
      >
        <Input
          placeholder={tStr("contactLabelPlaceholder")}
          tabIndex={1}
          maxLength={32}
        />
      </Form.Item>

      {/* Contact address */}
      <AddressPicker
        name="address"
        label={tStr("contactAddressLabel")}
        value={address}
        noWallets
        tabIndex={2}
      />
    </Form>
  </Modal>;
}

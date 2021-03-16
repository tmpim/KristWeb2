// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Button, Dropdown, Menu, Tooltip } from "antd";
import { DownOutlined, SwapOutlined, SendOutlined, EditOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { KristName } from "@api/types";
import { useNameSuffix } from "@utils/currency";

import { SendTransactionModalLink } from "@comp/transactions/SendTransactionModalLink";
import { NameEditModalLink } from "./NameEditModalLink";

interface Props {
  name: KristName;
  isOwn: boolean;
}

export function NameActions({ name, isOwn }: Props): JSX.Element {
  const { t } = useTranslation();

  const nameSuffix = useNameSuffix();
  const nameWithSuffix = `${name.name}.${nameSuffix}`;

  // The dropdown menu, used if we own the name
  const buttonMenu = isOwn ? <Menu>
    {/* Transfer Krist button */}
    <Menu.Item key="1">
      <SendTransactionModalLink to={nameWithSuffix}>
        <div><SwapOutlined /> {t("names.actionsTransferKrist")}</div>
      </SendTransactionModalLink>
    </Menu.Item>

    <Menu.Divider />

    {/* Update A record */}
    <Menu.Item key="2">
      <NameEditModalLink
        mode="update"
        name={name.name}
        aRecord={name.a}
      >
        <div><EditOutlined /> {t("names.actionsUpdateARecord")}</div>
      </NameEditModalLink>
    </Menu.Item>

    {/* Transfer name */}
    <Menu.Item key="3" danger>
      <NameEditModalLink
        mode="transfer"
        name={name.name}
      >
        <div><SendOutlined /> {t("names.actionsTransferName")}</div>
      </NameEditModalLink>
    </Menu.Item>
  </Menu> : undefined;

  if (isOwn) {
    // Actions dropdown (own name)
    return <Dropdown
      className="table-actions name-actions"
      trigger={["click"]}
      overlay={buttonMenu!}
    >
      <Button>
        {t("names.actions")} <DownOutlined />
      </Button>
    </Dropdown>;
  } else {
    // Send transaction button (not own name)
    return <SendTransactionModalLink to={nameWithSuffix}>
      <Button
        className="table-actions name-actions"
        icon={<SendOutlined />}
      >
        {t("names.actionsSendKrist")}
      </Button>
    </SendTransactionModalLink>;
  }
}

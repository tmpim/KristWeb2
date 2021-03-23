// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo } from "react";
import { Button, Dropdown, Menu } from "antd";
import { DownOutlined, SwapOutlined, SendOutlined, EditOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { KristName } from "@api/types";
import { useNameSuffix } from "@utils/currency";

import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { OpenEditNameFn } from "./NameEditModalLink";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";
import { NameEditModalLink } from "./NameEditModalLink";

interface Props {
  name: KristName;
  isOwn: boolean;

  openNameEdit: OpenEditNameFn;
  openSendTx: OpenSendTxFn;
}

export function NameActions({
  name,
  isOwn,

  openNameEdit,
  openSendTx
}: Props): JSX.Element {
  const { t } = useTranslation();

  const nameSuffix = useNameSuffix();
  const nameWithSuffix = `${name.name}.${nameSuffix}`;

  // The dropdown menu, used if we own the name
  const buttonMenu = useMemo(() => isOwn
    ? <Menu>
      {/* Transfer Krist button */}
      <Menu.Item key="1">
        <AuthorisedAction
          onAuthed={() => openSendTx(undefined, nameWithSuffix)}
          popoverPlacement="left"
        >
          <div><SwapOutlined /> {t("names.actionsTransferKrist")}</div>
        </AuthorisedAction>
      </Menu.Item>

      <Menu.Divider />

      {/* Update A record */}
      <Menu.Item key="2">
        <AuthorisedAction
          onAuthed={() => openNameEdit("update", name.name, name.a)}
          popoverPlacement="left"
        >
          <div><EditOutlined /> {t("names.actionsUpdateARecord")}</div>
        </AuthorisedAction>
      </Menu.Item>

      {/* Transfer name */}
      <Menu.Item key="3" danger>
        <AuthorisedAction
          onAuthed={() => openNameEdit("transfer", name.name)}
          popoverPlacement="left"
        >
          <div><SendOutlined /> {t("names.actionsTransferName")}</div>
        </AuthorisedAction>
      </Menu.Item>
    </Menu>
    : undefined,
  [t, isOwn, name.a, name.name, nameWithSuffix, openSendTx, openNameEdit]);

  const actions = useMemo(() => isOwn
    ? (
      // Actions dropdown (own name)
      <Dropdown
        className="table-actions name-actions"
        trigger={["click"]}
        overlay={buttonMenu!}
      >
        <Button>
          {t("names.actions")} <DownOutlined />
        </Button>
      </Dropdown>
    )
    : (
      // Send transaction button (not own name)
      <AuthorisedAction
        onAuthed={() => openSendTx(undefined, nameWithSuffix)}
        popoverPlacement="left"
      >
        <Button
          className="table-actions name-actions"
          icon={<SendOutlined />}
        >
          {t("names.actionsSendKrist")}
        </Button>
      </AuthorisedAction>
    ),
  [t, buttonMenu, isOwn, nameWithSuffix, openSendTx]);

  return actions;
}

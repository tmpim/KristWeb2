// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useMemo } from "react";
import { Button, Dropdown, Menu } from "antd";
import { DownOutlined, SwapOutlined, SendOutlined, EditOutlined } from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { KristName } from "@api/types";
import { useNameSuffix } from "@utils/currency";

import { useAuth } from "@comp/auth";
import { OpenEditNameFn } from "./NameEditModalLink";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";

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
  const { tStr } = useTFns("names.");
  const promptAuth = useAuth();

  const nameSuffix = useNameSuffix();
  const nameWithSuffix = `${name.name}.${nameSuffix}`;

  const actions = useMemo(() => isOwn
    ? (
      // Actions dropdown (own name)
      <Dropdown
        className="table-actions name-actions"
        trigger={["click"]}
        overlay={() => (
          <Menu>
            {/* Transfer Krist button */}
            <Menu.Item key="1" icon={<SwapOutlined />}
              onClick={() => promptAuth(false, () =>
                openSendTx(undefined, nameWithSuffix))}>
              {tStr("actionsTransferKrist")}
            </Menu.Item>

            <Menu.Divider />

            {/* Update A record */}
            <Menu.Item key="2" icon={<EditOutlined />}
              onClick={() => promptAuth(false, () =>
                openNameEdit("update", name.name, name.a))}>
              {tStr("actionsUpdateARecord")}
            </Menu.Item>

            {/* Transfer name */}
            <Menu.Item key="3" danger icon={<SendOutlined />}
              onClick={() => promptAuth(false, () =>
                openNameEdit("transfer", name.name))}>
              {tStr("actionsTransferName")}
            </Menu.Item>
          </Menu>
        )}
      >
        <Button>
          {tStr("actions")} <DownOutlined />
        </Button>
      </Dropdown>
    )
    : (
      // Send transaction button (not own name)
      <Button
        className="table-actions name-actions"
        icon={<SendOutlined />}
        onClick={() => promptAuth(false, () =>
          openSendTx(undefined, nameWithSuffix))}
      >
        {tStr("actionsSendKrist")}
      </Button>
    ),
  [tStr, isOwn, nameWithSuffix, openSendTx, name.a, name.name,
    openNameEdit, promptAuth]);

  return actions;
}

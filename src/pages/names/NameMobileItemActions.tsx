// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Menu } from "antd";
import {
  ProfileOutlined, SwapOutlined, SendOutlined, EditOutlined
} from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

import { useHistory } from "react-router-dom";

import { KristName } from "@api/types";
import { useNameSuffix } from "@utils/krist";

import { useAuth } from "@comp/auth";
import { OpenEditNameFn } from "./mgmt/NameEditModalLink";
import { OpenSendTxFn } from "@comp/transactions/SendTransactionModalLink";

interface Props {
  name: KristName;
  isOwn: boolean;

  openNameEdit: OpenEditNameFn;
  openSendTx: OpenSendTxFn;
}

export function NameMobileItemActions({
  name, isOwn,
  openNameEdit,
  openSendTx
}: Props): JSX.Element {
  const { tStr } = useTFns("names.");

  const history = useHistory();
  const promptAuth = useAuth();

  const nameSuffix = useNameSuffix();
  const nameWithSuffix = `${name.name}.${nameSuffix}`;

  const nameLink = `/network/names/${encodeURIComponent(name.name)}`;
  const ownerLink = `/network/addresses/${encodeURIComponent(name.owner)}`;
  const originalOwnerLink = name.original_owner && name.owner !== name.original_owner
    ? `/network/addresses/${encodeURIComponent(name.original_owner)}`
    : undefined;

  return <Menu selectable={false}>
    {/* View name */}
    <Menu.Item key="1" icon={<ProfileOutlined />}
      onClick={() => history.push(nameLink)}>
      {tStr("actionsViewName")}
    </Menu.Item>

    {/* View owner address */}
    <Menu.Item key="2" icon={<ProfileOutlined />}
      onClick={() => history.push(ownerLink)}>
      {tStr("actionsViewOwner")}
    </Menu.Item>

    {/* View original owner address */}
    {originalOwnerLink && <Menu.Item key="3" icon={<ProfileOutlined />}
      onClick={() => history.push(originalOwnerLink)}>
      {tStr("actionsViewOriginalOwner")}
    </Menu.Item>}

    {/* Send/transfer Krist */}
    <Menu.Item key="4" icon={isOwn ? <SwapOutlined /> : <SendOutlined />}
      onClick={() => promptAuth(false, () =>
        openSendTx(undefined, nameWithSuffix))}>
      {tStr(isOwn ? "actionsTransferKrist" : "actionsSendKrist")}
    </Menu.Item>

    {/* Name management actions if we own the name */}
    {isOwn && <>
      <Menu.Divider />

      {/* Update A record */}
      <Menu.Item key="5" icon={<EditOutlined />}
        onClick={() => promptAuth(false, () =>
          openNameEdit("update", name.name, name.a))}>
        {tStr("actionsUpdateARecord")}
      </Menu.Item>

      {/* Transfer name */}
      <Menu.Item key="6" danger icon={<SendOutlined />}
        onClick={() => promptAuth(false, () =>
          openNameEdit("transfer", name.name))}>
        {tStr("actionsTransferName")}
      </Menu.Item>
    </>}
  </Menu>;
}

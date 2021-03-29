// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useCallback } from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import { useTFns } from "@utils/i18n";

interface HookRes {
  resetMasterPasswordCtx: JSX.Element;
  openResetMasterPassword: () => void;
}

export function useResetMasterPasswordModal(): HookRes {
  const { tStr } = useTFns("masterPassword.reset.");
  const [modal, contextHolder] = Modal.useModal();

  const openResetMasterPassword = useCallback(() => modal.confirm({
    icon: <ExclamationCircleOutlined />,
    title: tStr("modalTitle"),
  }), [tStr, modal]);

  return {
    resetMasterPasswordCtx: contextHolder,
    openResetMasterPassword
  };
}

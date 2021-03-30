// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useCallback, useRef } from "react";
import { Modal, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import { Trans } from "react-i18next";
import { useTFns } from "@utils/i18n";

import { resetMasterPassword } from "@wallets";

import { random } from "lodash-es";

const { Link } = Typography;

interface HookRes {
  resetMasterPasswordCtx: JSX.Element;
  openResetMasterPassword: () => void;
}

export function useResetMasterPasswordModal(
  openExportBackup: () => void
): HookRes {
  const { t, tStr, tKey } = useTFns("masterPassword.reset.");
  const [modal, contextHolder] = Modal.useModal();

  const countUp = useRef(1);
  const countUpMax = useRef(5);
  const confirmModalRef = useRef<ReturnType<typeof Modal.confirm>>();

  const confirm2 = useCallback(() => modal.confirm({
    icon: <ExclamationCircleOutlined />,

    width: 800,

    title: tStr("modalTitle2"),
    content: <Trans i18nKey={tKey("description2")}>
      Are you REALLY sure you want to <strong>DELETE ALL YOUR WALLETS</strong>?
    </Trans>,

    okButtonProps: { danger: true, disabled: true },
    okText: t(tKey("buttonConfirm2"), { n: countUp.current }),
    onOk: resetMasterPassword,

    cancelText: t("dialog.no"),
    autoFocusButton: "cancel",
  }), [t, tStr, tKey, modal]);

  // Make the final confirmation button count-up in a really annoying way, so
  // if a user still ignores this and deletes their passwords, they're just an
  // idiot.
  const incrementCountUp = useCallback(() => {
    setTimeout(() => {
      const confirmModal = confirmModalRef.current;
      if (!confirmModal) return;

      if (countUp.current++ < countUpMax.current) {
        // Update the count-up button text
        confirmModal.update({
          okText: t(tKey("buttonConfirm2"), { n: countUp.current })
        });
        incrementCountUp();
      } else {
        // Count-up complete, enable the button
        confirmModal.update({
          okButtonProps: { danger: true },
          okText: tStr("buttonConfirmFinal")
        });
      }
    }, random(1300, 1800));
  }, [t, tStr, tKey]);

  // First confirmation dialog
  const openResetMasterPassword = useCallback(() => modal.confirm({
    icon: <ExclamationCircleOutlined />,

    title: tStr("modalTitle"),
    content: <Trans i18nKey={tKey("description")}>
      Are you sure you want to reset your master password?
      <strong>All your wallets will be deleted.</strong>
      Make sure to
      <Link onClick={openExportBackup}>export a backup</Link>
      first!
    </Trans>,

    okButtonProps: { danger: true },
    okText: tStr("buttonConfirm"),
    onOk: () => {
      // Open the modal, initially with the confirm button disabled
      countUp.current = 1;
      countUpMax.current = random(5, 7);
      confirmModalRef.current = confirm2();
      incrementCountUp();
    },

    autoFocusButton: "cancel"
  }), [tStr, tKey, modal, openExportBackup, confirm2, incrementCountUp]);

  return {
    resetMasterPasswordCtx: contextHolder,
    openResetMasterPassword
  };
}

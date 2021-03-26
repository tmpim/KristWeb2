// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useRef } from "react";
import { Modal, Input } from "antd";

import { useTFns } from "@utils/i18n";

import { useAuthForm } from "./AuthForm";

interface Props {
  visible: boolean;
  encrypt?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function AuthMasterPasswordModal({
  visible,
  encrypt,
  onCancel,
  onSubmit
}: Props): JSX.Element {
  const { t, tStr } = useTFns("masterPassword.");
  const inputRef = useRef<Input>(null);

  const { form, submit, reset } = useAuthForm(encrypt, onSubmit, inputRef);

  return <Modal
    title={tStr("dialogTitle")}
    okText={tStr("popoverAuthoriseButton")}
    cancelText={t("dialog.cancel")}

    visible={visible}
    destroyOnClose

    onCancel={() => { reset(); onCancel(); }}
    onOk={submit}
  >
    {form}
  </Modal>;
}

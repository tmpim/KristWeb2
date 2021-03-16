// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useTranslation, Trans, TFunction } from "react-i18next";

import { ContextualAddress } from "@comp/addresses/ContextualAddress";
import { ModalStaticFunctions } from "antd/lib/modal/confirm";

interface Props {
  count: number;
  recipient?: string;
  allNamesCount: number;
}

export function showConfirmModal(
  t: TFunction,
  confirmModal: Omit<ModalStaticFunctions, "warn">,
  count: number,
  allNamesCount: number,
  recipient: string,
  triggerSubmit: () => void,
  setSubmitting: (value: boolean) => void,
): void {
  confirmModal.confirm({
    title: t("nameTransfer.modalTitle"),
    content: <ConfirmModalContent
      count={count}
      allNamesCount={allNamesCount}
      recipient={recipient}
    />,

    okText: t("nameTransfer.buttonSubmit"),
    onOk: triggerSubmit,

    cancelText: t("dialog.cancel"),
    onCancel: () => setSubmitting(false)
  });
}

// No 'Mode' necessary, this is only shown for transfers
function ConfirmModalContent({
  count,
  recipient,
  allNamesCount
}: Props): JSX.Element {
  const { t } = useTranslation();

  // Show the appropriate message, if this is all the owner's names
  return <Trans
    t={t}
    i18nKey={count >= allNamesCount
      ? "nameTransfer.warningAllNames"
      : "nameTransfer.warningMultipleNames"}
    count={count}
  >
    Are you sure you want to transfer <b>{{ count }}</b> names to
    <ContextualAddress address={recipient!} />?
  </Trans>;
}

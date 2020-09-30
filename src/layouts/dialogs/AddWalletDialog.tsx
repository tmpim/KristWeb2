import React from "react";

import { useTranslation } from "react-i18next";

import { IconButton } from "@components/icon-button/IconButton";

import { ModalDialog, withDialogLink } from "./ModalDialog";

export const AddWalletButton = withDialogLink(
  (show, handleClose) => 
    <AddWalletDialog show={show} handleClose={handleClose} create={false} />
)(IconButton);

export const CreateWalletButton = withDialogLink(
  (show, handleClose) => 
    <AddWalletDialog show={show} handleClose={handleClose} create={true} />
)(IconButton);

interface Props {
  show: boolean;
  handleClose: () => void;

  /** If true, show the 'create wallet' dialog instead of the 'add wallet'
   * dialog. */
  create?: boolean;
}

export const AddWalletDialog: React.FC<Props> = ({ show, handleClose, create }: Props) => {
  const { t } = useTranslation();

  return <ModalDialog
    show={show}
    handleClose={handleClose}
    title={t(create ? "addWallet.dialogTitleCreate" : "addWallet.dialogTitle")}
  >
    Placeholder
  </ModalDialog>;
};

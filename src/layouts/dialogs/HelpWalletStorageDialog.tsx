import React, { Component, ReactNode } from "react";

import { useTranslation, WithTranslation, withTranslation } from "react-i18next";

import { WithDialogLink, withDialogLink, ModalDialog } from "./ModalDialog";

class HelpWalletStorageLinkComponent extends Component<WithDialogLink & WithTranslation> {
  render(): ReactNode {
    const { t, openDialog } = this.props;
    return <a href="#" onClick={openDialog}>
      {t("masterPassword.learnMore")}
    </a>;
  }
}

export const HelpWalletStorageLink = withTranslation()(withDialogLink(
  (show, handleClose) => 
    <HelpWalletStorageDialog
      show={show}
      handleClose={handleClose} 
    />
)(HelpWalletStorageLinkComponent));

interface Props {
  show: boolean;
  handleClose: () => void;
}

export const HelpWalletStorageDialog: React.FC<Props> = ({ show, handleClose }: Props) => {
  const { t } = useTranslation();

  const paragraphs = t("masterPassword.helpWalletStorage").split("\n");

  return (
    <ModalDialog 
      show={show}
      handleClose={handleClose}
      hasCloseButton={true}
      hasFooterCloseButton={true}
      title={t("masterPassword.helpWalletStorageTitle")}
    >
      {paragraphs.map((text, i) => 
        <p key={i} className={i === paragraphs.length - 1 ? "mb-0" : ""}>
          {text}
        </p>
      )}
    </ModalDialog>
  );
};

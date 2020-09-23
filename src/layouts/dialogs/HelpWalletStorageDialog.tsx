import React, { useState, MouseEvent } from "react";

import { useTranslation } from "react-i18next";

import { ModalDialog } from "./ModalDialog";

export const HelpWalletStorageLink: React.FC = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  // Help dialog show/close state is essentially handled by the link
  const handleClose = () => setShow(false);
  const handleShow = (e: MouseEvent) => {
    e.preventDefault();
    setShow(true);
  };

  return (
    <>
      {/* Add a link to show the dialog */}
      {/* TODO: make this a <button> */}
      {/* eslint-disable-next-line */}
      (<a href="#" onClick={handleShow}>{t("masterPassword.learnMore")}</a>)
      <HelpWalletStorageDialog
        show={show}
        handleClose={handleClose}
      />
    </>
  );
};

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

import React, { useState, MouseEvent } from "react";

import { ModalDialog } from "./ModalDialog";

export const HelpWalletStorageLink: React.FC = () => {
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
      (<a href="#" onClick={handleShow}>learn more</a>)
      <HelpWalletStorageDialog
        show={show}
        handleClose={handleClose}
      />
    </>
  );
};

type Props = {
  show: boolean;
  handleClose: () => void;
}

export const HelpWalletStorageDialog: React.FC<Props> = ({ show, handleClose }: Props) => (
  <ModalDialog 
    show={show}
    handleClose={handleClose}
    hasCloseButton={true}
    hasFooterCloseButton={true}
    title="Help: Wallet storage"
  >
    <p>
      When you add a wallet to KristWeb, the privatekey for the wallet is 
      saved to your browser&apos;s local storage and encrypted with your 
      master password.
    </p>
    <p>
      Every wallet you save is encrypted using the same master password, and 
      you will need to enter it every time you open KristWeb. Your actual 
      Krist wallet is not modified in any way.
    </p>
    <p className="mb-0">
      When browsing KristWeb as a guest, you do not need to enter a master
      password, but it also means that you will not be able to add or use any
      wallets. You will still be able to explore the Krist network.
    </p>
  </ModalDialog>
);

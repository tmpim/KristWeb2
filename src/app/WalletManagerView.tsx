import React, { Component } from "react";

import { MasterPasswordDialog } from "./MasterPasswordDialog";
import { WalletManager } from "./WalletManager";

interface Props {
  walletManager: WalletManager;
}

export class WalletManagerView extends Component<Props> {
  /** Render the master password login/setup dialog */
  render(): JSX.Element | null {
    const { walletManager } = this.props;
    const { isLoggedIn, hasMasterPassword } = walletManager;
    if (isLoggedIn) return null; // Don't show the dialog again

    return (
      <MasterPasswordDialog 
        hasMasterPassword={hasMasterPassword} // Show the setup dialog if needed
        walletManager={walletManager} 
      />
    );
  }
}

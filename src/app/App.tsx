import React, { Component } from "react";
import "./App.scss";

import { MainLayout } from "../layouts/main";

import { WalletManager } from "./WalletManager";
import { WalletManagerView } from "./WalletManagerView";

import { kristService } from "@krist/KristConnectionService";

import packageJson from "@/package.json";

kristService().connect(packageJson.defaultSyncNode) // TODO
  .catch(console.error);

interface AppState {
  walletManager: WalletManager;
}

export class App extends Component<unknown, AppState> {
  constructor(props: unknown) {
    super(props);

    this.state = {
      walletManager: new WalletManager((walletManager: WalletManager) => {
        this.setState({ walletManager });
      })
    };
  }

  render(): JSX.Element {
    const { walletManager } = this.state;

    return <>
      <MainLayout walletManager={walletManager} />
      <WalletManagerView walletManager={walletManager} />
    </>;
  }
}

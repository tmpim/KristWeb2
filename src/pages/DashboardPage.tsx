import React from "react";
import { Button, message } from "antd";

import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState } from "../store";

import { syncWallets } from "../krist/wallets/Wallet";

import { PageLayout } from "../layout/PageLayout";
import { AuthorisedAction } from "../components/auth/AuthorisedAction";

export function DashboardPage(): JSX.Element {
  const { isAuthed, hasMasterPassword }
    = useSelector((s: RootState) => s.walletManager, shallowEqual);
  const { wallets } = useSelector((s: RootState) => s.wallets, shallowEqual);
  const dispatch = useDispatch();

  return <PageLayout siteTitle="(TEMPORARY) Dashboard"> {/* TODO */}
    <p>Is authed: {isAuthed ? "yes" : "no"}</p>
    <p>Has master password: {hasMasterPassword ? "yes" : "no"}</p>

    <Button onClick={() => syncWallets(dispatch, wallets).catch(console.error)}>Sync wallets</Button>

    <br /><br />

    <Button danger onClick={() => {
      localStorage.removeItem("salt");
      localStorage.removeItem("tester");
      location.reload();
    }}>Clear master password from storage</Button>

    <br /><br />

    <AuthorisedAction onAuthed={() => message.success("Something authed happened!")}>
      <Button type="primary">Perform authorised action</Button>
    </AuthorisedAction>
  </PageLayout>;
}

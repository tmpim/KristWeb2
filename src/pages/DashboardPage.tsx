import { Button, message } from "antd";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../store";

import { PageLayout } from "../layout/PageLayout";
import { AuthorisedAction } from "../components/auth/AuthorisedAction";

export function DashboardPage() {
  const { isAuthed, salt, tester, hasMasterPassword }
    = useSelector((s: RootState) => s.walletManager, shallowEqual);

  return <PageLayout title="(TEMPORARY) Dashboard"> {/* TODO */}
    <p>Is authed: {isAuthed ? "yes" : "no"}</p>
    <p>Has master password: {hasMasterPassword ? "yes" : "no"}</p>

    <Button danger onClick={() => {
      localStorage.removeItem("salt");
      localStorage.removeItem("tester");
      location.reload();
    }}>Clear master password from storage</Button>

    <br /><br />

    <AuthorisedAction onAuthed={() => message.success("Something authed happened!")}>
      <Button type="primary">Perform authorised action</Button>
    </AuthorisedAction>
  </PageLayout>
}

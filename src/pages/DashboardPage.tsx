import { Button } from "antd";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../store";

import { PageLayout } from "../layout/PageLayout";
import { AuthorisedAction } from "../components/AuthorisedAction";

export function DashboardPage() {
  const { isAuthed, salt, tester, hasMasterPassword }
    = useSelector((s: RootState) => s.walletManager, shallowEqual);

  return <PageLayout title="(TEMPORARY) Dashboard"> {/* TODO */}
    <p>Is authed: {isAuthed ? "yes" : "no"}</p>
    <p>Has master password: {hasMasterPassword ? "yes" : "no"}</p>

    <AuthorisedAction>
      <Button type="primary">Perform authorised action</Button>
    </AuthorisedAction>
  </PageLayout>
}

import React, { useState } from "react";
import { Button } from "antd";
import { DatabaseOutlined, PlusOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { PageLayout } from "../../layout/PageLayout";
import { AuthorisedAction } from "../../components/auth/AuthorisedAction";
import { AddWalletModal } from "./AddWalletModal";

function WalletsPageExtraButtons(): JSX.Element {
  const { t } = useTranslation();
  const [createWalletVisible, setCreateWalletVisible] = useState(false);
  const [addWalletVisible, setAddWalletVisible] = useState(false);

  return <>
    <Button icon={<DatabaseOutlined />}>{t("myWallets.manageBackups")}</Button>

    <AuthorisedAction encrypt onAuthed={() => setCreateWalletVisible(true)}>
      <Button type="primary" icon={<PlusOutlined />}>
        {t("myWallets.createWallet")}
      </Button>
    </AuthorisedAction>
    <AddWalletModal create visible={createWalletVisible} setVisible={setCreateWalletVisible} />

    <AuthorisedAction encrypt onAuthed={() => setAddWalletVisible(true)}>
      <Button ghost>{t("myWallets.addExistingWallet")}</Button>
    </AuthorisedAction>
    <AddWalletModal visible={addWalletVisible} setVisible={setAddWalletVisible} />
  </>;
}

export function WalletsPage(): JSX.Element {
  const { t } = useTranslation();

  return <PageLayout
    siteTitleKey="myWallets.title" titleKey="myWallets.title"
    extra={<WalletsPageExtraButtons />}
  >
    Hello, world
  </PageLayout>;
}

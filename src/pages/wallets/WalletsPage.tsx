// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState } from "react";
import { Button } from "antd";
import { DatabaseOutlined, PlusOutlined } from "@ant-design/icons";

import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store";
import { useTranslation } from "react-i18next";

import { PageLayout } from "../../layout/PageLayout";
import { AuthorisedAction } from "../../components/auth/AuthorisedAction";
import { AddWalletModal } from "./AddWalletModal";
import { WalletsTable } from "./WalletsTable";

import "./WalletsPage.less";

/** Extract the subtitle into its own component to avoid re-rendering the
 * entire page when a wallet is added. */
function WalletsPageSubtitle(): JSX.Element {
  const { t } = useTranslation();
  const { wallets } = useSelector((s: RootState) => s.wallets, shallowEqual);

  return <>{t("myWallets.walletCount", { count: Object.keys(wallets).length })}</>;
}

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
    <AddWalletModal create visible={createWalletVisible} setVisible={setCreateWalletVisible} setAddExistingVisible={setAddWalletVisible} />

    <AuthorisedAction encrypt onAuthed={() => setAddWalletVisible(true)}>
      <Button ghost>{t("myWallets.addExistingWallet")}</Button>
    </AuthorisedAction>
    <AddWalletModal visible={addWalletVisible} setVisible={setAddWalletVisible} />
  </>;
}

export function WalletsPage(): JSX.Element {
  return <PageLayout
    siteTitleKey="myWallets.title" titleKey="myWallets.title"
    subTitle={<WalletsPageSubtitle />}
    extra={<WalletsPageExtraButtons />}
  >
    <WalletsTable />
  </PageLayout>;
}

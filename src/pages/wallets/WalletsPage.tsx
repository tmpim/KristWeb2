// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { Button } from "antd";
import { DatabaseOutlined, PlusOutlined } from "@ant-design/icons";

import { useTranslation } from "react-i18next";

import { PageLayout } from "@layout/PageLayout";
import { AuthorisedAction } from "@comp/auth/AuthorisedAction";
import { AddWalletModal } from "./AddWalletModal";
import { WalletsTable } from "./WalletsTable";

import { useWallets } from "@wallets";

import "./WalletsPage.less";

/** Extract the subtitle into its own component to avoid re-rendering the
 * entire page when a wallet is added. */
function WalletsPageSubtitle(): JSX.Element {
  const { t } = useTranslation();
  const { addressList } = useWallets();

  const count = addressList.length;

  return <>{count > 0
    ? t("myWallets.walletCount", { count })
    : t("myWallets.walletCountEmpty")
  }</>;
}

function WalletsPageExtraButtons(): JSX.Element {
  const { t } = useTranslation();
  const [createWalletVisible, setCreateWalletVisible] = useState(false);
  const [addWalletVisible, setAddWalletVisible] = useState(false);

  return <>
    <Button icon={<DatabaseOutlined />} className="nyi">
      {t("myWallets.manageBackups")}
    </Button>

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

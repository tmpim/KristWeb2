// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState } from "react";
import { Button } from "antd";
import { PageLayout } from "../../layout/PageLayout";

import { ImportBackupModal } from "../backup/ImportBackupModal";

export function DevPage(): JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);

  return <PageLayout
    title="Dev page"
    siteTitle="Dev page"
  >
    <Button onClick={() => setModalVisible(true)}>
      Open
    </Button>

    <ImportBackupModal visible={modalVisible} setVisible={setModalVisible} />
  </PageLayout>;
}

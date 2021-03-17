// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState, Dispatch, SetStateAction } from "react";
import { Modal, Row, Col, Button } from "antd";

import { useTFns } from "@utils/i18n";

import { KristValue } from "@comp/krist/KristValue";

import { GlobalHotKeys } from "react-hotkeys";

interface Props {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

interface PurchaseOption {
  image?: string;
  source: number;
  krist: number;
}

const VALUES: PurchaseOption[][] = [
  [
    { source: 5000, krist: 50 }, { source: 10000, krist: 100 },
    { source: 25000, krist: 250 }, { source: 50000, krist: 500 }
  ],
  [
    { source: 100000, krist: 1000 }, { source: 250000, krist: 2500 },
    { source: 500000, krist: 5000 }, { source: 500000000, krist: 5000000 }
  ]
];

export function PurchaseKrist({
  visible,
  setVisible
}: Props): JSX.Element {
  const { t, tStr } = useTFns("purchaseKrist.");

  return <Modal
    visible={visible}

    title={tStr("modalTitle")}
    width={750}

    footer={<Button onClick={() => setVisible(false)}>
      {t("dialog.close")}
    </Button>}
    onCancel={() => setVisible(false)}
  >
    {VALUES.map((row, i) => <Row key={i} gutter={8}>
      {row.map((option, i) => (
        <Col
          span={6}
          key={i}
          style={{ padding: 8, textAlign: "center" }}
        >
          <div style={{
            background: "#2a304a",
            borderRadius: 2,
            height: 128,
            padding: 16
          }}>
            <KristValue value={option.source} icon={"₩"} />
            <br /><br />
            <KristValue value={option.krist} long />
          </div>
        </Col>
      ))}
    </Row>)}
  </Modal>;
}

export function PurchaseKristHandler(): JSX.Element {
  const [visible, setVisible] = useState(false);

  return <>
    <PurchaseKrist
      visible={visible}
      setVisible={setVisible}
    />

    <GlobalHotKeys
      keyMap={{ EPIC: ["up up down down left right left right b a enter"] }}
      handlers={{ EPIC: () => setVisible(true) }}
    />
  </>;
}

import React, { useState } from "react";
import { Space, Spin, Button } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import packageJson from "../../../package.json";

import { useMountEffect } from "../../utils";

interface Supporter {
  name: string;
  url?: string;
}

interface SupportersState {
  loaded: boolean;
  supporters?: Supporter[];
}

export function Supporters(): JSX.Element | null {
  const { supportURL, supportersURL } = packageJson;

  const { t } = useTranslation();
  const [supportersState, setSupportersState] = useState<SupportersState>({
    loaded: false,
    supporters: undefined
  });

  useMountEffect(() => {
    (async () => {
      // GPU required for this function:
      const res = await fetch(supportersURL);
      const data = await res.json();

      setSupportersState({
        loaded: true,
        supporters: data.supporters
      });
    })();
  });

  if (!supportURL) return null;
  return <Space direction="vertical">
    <Spin delay={500} spinning={!supportersState.loaded}>
      {/* Description */}
      <p>{t("credits.supportersDescription")}</p>

      {/* Supporter list */}
      <Space align="center" wrap size={8} style={{ justifyContent: "center" }}>
        {supportersState.supporters && supportersState.supporters.map(({ url, name }) => (
          url
            ? <a key={name} target="_blank" rel="noopener noreferrer" href={url} className="supporter-name">{name}</a>
            : <span key={name} className="supporter-name">{name}</span>
        ))}
      </Space>
    </Spin>

    {/* Support Button */}
    <Button type="primary" size="large" href={supportURL} target="_blank" rel="noopener noreferrer" style={{ marginTop: 16 }}>
      <DollarOutlined /> {t("credits.supportButton")}
    </Button>
  </Space>;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Space, Button, List, Typography } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { Flag } from "@comp/Flag";

import { getLanguages } from "@utils/i18n";
import packageJson from "../../../package.json";

const { Text } = Typography;

export function Translators(): JSX.Element | null {
  const { t } = useTranslation();

  const { translateURL } = packageJson;
  if (!translateURL) return null;

  const languages = getLanguages();
  if (!languages) return null;

  return <Space direction="vertical">
    {/* Description */}
    <p>{t("credits.translatorsDescription")}</p>

    {/* Language list */}
    <List
      size="small"
      dataSource={Object.entries(languages).filter(([code, lang]) => code !== "en" && lang.contributors.length > 0)}
      renderItem={([, lang]) => <List.Item>
        <List.Item.Meta
          style={{ textAlign: "left" }}
          avatar={<Flag code={lang.country} name={lang.name} />}
          title={<>{lang.name}&nbsp;{lang.nativeName && <Text type="secondary">({lang.nativeName})</Text>}</>}
          description={<Space size={8} wrap>
            {lang.contributors.map(({ url, name }) => (
              url
                ? <a key={name} target="_blank" rel="noopener noreferrer" href={url} className="supporter-name">{name}</a>
                : <span key={name} className="supporter-name">{name}</span>
            ))}
          </Space>}
        />
      </List.Item>}
    />

    {/* Translate Button */}
    <Button type="primary" size="large" href={translateURL} target="_blank" rel="noopener noreferrer" style={{ marginTop: 16 }}>
      <GlobalOutlined /> {t("credits.translateButton")}
    </Button>
  </Space>;
}

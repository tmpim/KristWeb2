import { Space, Button, List, Typography } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { Flag } from "../../components/Flag";

import packageJson from "../../../package.json";

const { Text } = Typography;

// Find languages.json
const req = require.context("../../../", false, /\.\/languages.json$/);

interface Language {
  name: string;
  nativeName?: string;
  country?: string;
  contributors: Contributor[];
};

interface Contributor {
  name: string;
  url?: string;
}

export function Translators() {
  const { t } = useTranslation();

  const { translateURL } = packageJson;
  if (!translateURL) return null;

  // Get the translator information from languages.json
  if (!req.keys().includes("./languages.json")) return null;
  const languages: { [key: string]: Language } = req("./languages.json");

  return <Space direction="vertical">
    {/* Description */}
    <p>{t("credits.translatorsDescription")}</p>

    {/* Language list */}
    <List
      size="small"
      dataSource={Object.entries(languages).filter(([code, lang]) => code !== "en" && lang.contributors.length > 0)}
      renderItem={([code, lang]) => <List.Item>
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
  </Space>
}

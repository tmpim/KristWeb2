import React, { Component, ReactNode } from "react";

import { withTranslation, WithTranslation } from "react-i18next";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import packageJson from "@/package.json";

// Find languages.json
const req = require.context("@/", false, /\.\/languages.json$/);

interface Language {
  name: string;
  nativeName?: string;
  country?: string;
  contributors?: Contributor[];
};

interface Contributor {
  name: string;
  url?: string;
}

const ContributorComponent: React.FC<Contributor> = ({ name, url }: Contributor) => (
  url
    ? <a target="_blank" rel="noopener noreferrer" className="d-inline-block mx-2 font-weight-bold" href={url}>{name}</a>
    : <span className="d-inline-block m-2 font-weight-bold">{name}</span>
);

const LanguageComponent: React.FC<Language> = (lang: Language) => (
  <li>
    {/* Language name, and native name if applicable */}
    <b>{lang.name}{lang.nativeName && <span className="text-quiet"> ({lang.nativeName})</span>}</b>
    <span className="text-muted ml-2">&ndash;</span>
    {/* List of contributors */}
    {lang.contributors && lang.contributors.map(({ url, name }) =>
      <ContributorComponent key={name} url={url} name={name} />)}
  </li>
);

export class TranslatorsComponent extends Component<WithTranslation> {
  render(): ReactNode {
    const { t } = this.props;

    const translateURL = packageJson.translateURL;
    if (!translateURL) return null;

    // Get the translator information from languages.json
    if (!req.keys().includes("./languages.json")) return null;
    const languages: { [key: string]: Language } = req("./languages.json");
    
    return <>
      <Row>
        <Col className="text-center">
          <h3>{t("credits.translatorsTitle")}</h3>     
          <p>{t("credits.translatorsDescription")}</p>
        </Col>
      </Row>
      <Row> {/* Language list */}
        <Col className="text-center mw-50">
          <ul className="list-unstyled">
            {Object.entries(languages)
              .filter(([code, lang]) => code !== "en" && lang.contributors && lang.contributors.length > 0)
              .map(([code, lang]) => <LanguageComponent key={code} {...lang} />)}            
          </ul>
        </Col>
      </Row>
      <Row> {/* Translate button */}
        <Col className="text-center mt-4">
          <Button variant="success" as="a" href={translateURL} target="_blank" rel="noopener noreferrer">
            {t("credits.translateButton")} 
          </Button>
        </Col>
      </Row>
    </>;
  }
}

export const Translators = withTranslation()(TranslatorsComponent);

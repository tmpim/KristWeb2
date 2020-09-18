import React, { Component, ReactNode } from "react";

import { withTranslation, WithTranslation } from "react-i18next";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import packageJson from "@/package.json";

// Find translators.json
const req = require.context("@/", false, /\.\/translators.json$/);

interface Translator {
  name: string;
  url?: string;
};

export class TranslatorsComponent extends Component<WithTranslation> {
  render(): ReactNode {
    const { t } = this.props;

    const translateURL = packageJson.translateURL;
    if (!translateURL) return null;

    // Get the translator information from translators.json
    if (!req.keys().includes("./translators.json")) return null;
    const translators: { [key: string]: Translator[] } = req("./translators.json");
    
    return <>
      <Row>
        <Col className="text-center">
          <h3>{t("credits.translatorsTitle")}</h3>     
          <p>{t("credits.translatorsDescription")}</p>
        </Col>
      </Row>
      <Row> {/* Translator list */}
        <Col className="text-center mw-50">
          <ul className="list-unstyled">
            {Object.entries(translators).map(([language, people]) => 
              <li key={`translators-${language}`}>
                <b>{language}</b>
                <span className="text-muted ml-2">&ndash;</span>
                {people.map(({ url, name }: Translator) => 
                  url
                    ? <a key={name} target="_blank" rel="noopener noreferrer" className="d-inline-block m-2 font-weight-bold" href={url}>{name}</a>
                    : <span key={name} className="d-inline-block m-2 font-weight-bold">{name}</span>
                )}
              </li>  
            )}            
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

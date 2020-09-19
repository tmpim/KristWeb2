import React, { Component, ReactNode } from "react";

import { Trans, withTranslation, WithTranslation } from "react-i18next";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { Supporters } from "./Supporters";
import { Translators } from "./Translators";

import packageJson from "@/package.json";

class CreditsPageComponent extends Component<WithTranslation> {
  render(): ReactNode {
    const { t } = this.props;

    const authorName = packageJson.author || "Lemmmy";
    const authorURL = `https://github.com/${authorName}`;

    return <Container fluid className="py-4">
      {/* Main section */}
      <Row>
        <Col className="text-center">
          <h1>KristWeb v2</h1>     
          <p>
            <Trans t={t} i18nKey="credits.madeBy">
              Made by <a href={authorURL} target="_blank" rel="noopener noreferrer">{{authorName}}</a>
            </Trans>
          </p>   
        </Col>
      </Row>

      <hr className="py-2" />

      {/* Supporters section */}
      <Supporters />

      <hr className="py-2" />

      {/* Translators section */}
      <Translators />
    </Container>;
  }
}

export const CreditsPage = withTranslation()(CreditsPageComponent);

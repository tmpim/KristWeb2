import React, { Component, ReactNode } from "react";

import { Trans, withTranslation, WithTranslation } from "react-i18next";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import packageJson from "@/package.json";

interface Supporter {
  name: string;
  url?: string;
};

interface CreditsState {
  isLoaded: boolean;
  supporters: Supporter[] | null;
};

class CreditsPageComponent extends Component<WithTranslation, CreditsState> {
  constructor(props: WithTranslation) {
    super(props);
    
    this.state = {
      isLoaded: false,
      supporters: null
    };
  }

  componentDidMount(): void {
    const { supportersURL } = packageJson;
    if (!supportersURL) return;

    fetch(supportersURL)
      .then(res => res.json())
      .then(result => this.setState({
        isLoaded: true,
        supporters: result.supporters
      }))
      .catch(() => this.setState({ isLoaded: true }));
  }

  render(): ReactNode {
    const { t } = this.props;
    const { isLoaded, supporters } = this.state;

    const authorName = packageJson.author || "Lemmmy";
    const authorURL = `https://github.com/${authorName}`;
    const supportURL = packageJson.supportURL;

    return <Container fluid className="py-4">
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
      {supportURL && /* Supporters section */
        <>
          <Row>
            <Col className="text-center">
              <h3>{t("credits.supportersTitle")}</h3>     
              <p>{t("credits.supportersDescription")}</p>
            </Col>
          </Row>
          <Row> {/* Supporter list */}
            <Col className="text-center mw-50">
              {isLoaded && supporters !== null
                ? <Supporters supporters={supporters} />
                : <span className="text-muted">{t("loading")}</span>
              }              
            </Col>
          </Row>
          <Row> {/* Support button */}
            <Col className="text-center mt-4">
              <Button variant="success" as="a" href={supportURL} target="_blank" rel="noopener noreferrer">
                {t("credits.supportButton")}
              </Button>
            </Col>
          </Row>
        </>
      }
    </Container>;
  }
}

export const CreditsPage = withTranslation()(CreditsPageComponent);

interface SupportersProps {
  supporters: Supporter[];
}

export const Supporters: React.FC<SupportersProps> = ({ supporters }: SupportersProps) =>
  (<>{supporters.map(({ url, name }) => (
    url
      ? <a key={name} target="_blank" rel="noopener noreferrer" className="d-inline-block m-2 font-weight-bold" href={url}>{name}</a>
      : <span key={name} className="d-inline-block m-2 font-weight-bold">{name}</span>
  ))}</>);

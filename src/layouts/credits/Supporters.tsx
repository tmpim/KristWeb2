import React, { Component, ReactNode } from "react";

import { withTranslation, WithTranslation } from "react-i18next";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import packageJson from "@/package.json";

interface Supporter {
  name: string;
  url?: string;
};

interface State {
  isLoaded: boolean;
  supporters: Supporter[] | null;
};

class SupportersComponent extends Component<WithTranslation, State> {
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
    const supportURL = packageJson.supportURL;
    if (!supportURL) return null;

    const { t } = this.props;
    const { isLoaded, supporters } = this.state;
    
    return <>
      <Row>
        <Col className="text-center">
          <h3>{t("credits.supportersTitle")}</h3>     
          <p>{t("credits.supportersDescription")}</p>
        </Col>
      </Row>
      <Row> {/* Supporter list */}
        <Col className="text-center mw-50">
          {isLoaded && supporters !== null
            ? <SupportersList supporters={supporters} />
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
    </>;
  }
}

export const Supporters = withTranslation()(SupportersComponent);

interface SupportersListProps {
  supporters: Supporter[];
}

const SupportersList: React.FC<SupportersListProps> = ({ supporters }: SupportersListProps) =>
  (<>{supporters.map(({ url, name }) => (
    url
      ? <a key={name} target="_blank" rel="noopener noreferrer" className="d-inline-block m-2 font-weight-bold" href={url}>{name}</a>
      : <span key={name} className="d-inline-block m-2 font-weight-bold">{name}</span>
  ))}</>);

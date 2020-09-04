import React, { Component, ReactNode } from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import packageJson from "@/package.json";

type Supporter = {
  name: string,
  url?: string
};

type CreditsData = {
  isLoaded: boolean,
  supporters: Supporter[] | null
};

export class Credits extends Component<unknown, CreditsData> {
  constructor(props: unknown) {
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
    const { isLoaded, supporters } = this.state;
    const authorName = packageJson.author || "Lemmmy";
    const authorURL = `https://github.com/${authorName}`;
    const supportURL = packageJson.supportURL;

    return <Container fluid className="py-4">
      <Row>
        <Col className="text-center">
          <h1>KristWeb v2</h1>     
          <p>Made by <a href={authorURL} target="_blank" rel="noopener noreferrer">{authorName}</a></p>   
        </Col>
      </Row>
      <hr className="py-2" />
      {supportURL && /* Supporters section */
        <>
          <Row>
            <Col className="text-center">
              <h3>Supporters</h3>     
              <p>This project was made possible by the following amazing supporters:</p>
            </Col>
          </Row>
          <Row> {/* Supporter list */}
            <Col className="text-center mw-50">
              {isLoaded && supporters !== null
                ? <Supporters supporters={supporters} />
                : <span className="text-muted">Loading...</span>
              }              
            </Col>
          </Row>
          <Row> {/* Support button */}
            <Col className="text-center mt-4">
              <Button variant="success" as="a" href={supportURL} target="_blank" rel="noopener noreferrer">
                Support KristWeb
              </Button>
            </Col>
          </Row>
        </>
      }
    </Container>;
  }
}

export class Supporters extends Component<{supporters: Supporter[]}> {
  render(): ReactNode {
    return this.props.supporters.map(supporter => 
      (supporter.url
        ? <a target="_blank" rel="noopener noreferrer" className="d-inline-block m-2 font-weight-bold" href={supporter.url}>{supporter.name}</a>
        : <span className="d-inline-block m-2 font-weight-bold">{supporter.name}</span>
      ));
  }
}

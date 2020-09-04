import React, { Component, ReactNode } from "react";
import PropTypes from "prop-types";

import "./SidebarItem.scss";

import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";

type SidebarItemProps = {
  url: string,
  text: string,
  icon: string
};

export class SidebarItem extends Component<SidebarItemProps> {
  public static propTypes = {
    url: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
  }

  render(): ReactNode {
    const { url, text, icon } = this.props;

    return <Nav.Item>
      <LinkContainer to={url}>
        <Nav.Link>
          <span className={"sidebar-icon icon-" + icon}></span>
          {text}
        </Nav.Link>
      </LinkContainer>
    </Nav.Item>;
  }
}

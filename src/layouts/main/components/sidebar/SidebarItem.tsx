import React, { Component } from "react";
import PropTypes from "prop-types";

import "./SidebarItem.scss";

import Nav from "react-bootstrap/Nav";

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

  render() {
    const { url, text, icon } = this.props;

    return <Nav.Item>
      <Nav.Link href={url}>
        <span className={"sidebar-icon icon-" + icon}></span>
        {text}
      </Nav.Link>
    </Nav.Item>
  }
}
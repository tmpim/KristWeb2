import React from "react";

import "./SidebarItem.scss";

import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";

type Props = {
  url: string,
  text: string,
  icon: string
};

export const SidebarItem: React.FC<Props> = ({ url, text, icon }: Props) => (
  <Nav.Item>
    <LinkContainer to={url}>
      <Nav.Link>
        <span className={"sidebar-icon icon-" + icon}></span>
        {text}
      </Nav.Link>
    </LinkContainer>
  </Nav.Item>
);

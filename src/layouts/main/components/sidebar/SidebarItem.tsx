import React from "react";

import { useTranslation } from "react-i18next";

import "./SidebarItem.scss";

import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";

interface Props {
  url: string;
  textKey: string;
  icon: string;
};

export const SidebarItem: React.FC<Props> = ({ url, textKey, icon }: Props) => {
  const { t } = useTranslation();

  return (
    <Nav.Item>
      <LinkContainer to={url}>
        <Nav.Link>
          <span className={"sidebar-icon icon-" + icon}></span>
          {t(`sidebar.${textKey}`)}
        </Nav.Link>
      </LinkContainer>
    </Nav.Item>
  );
};

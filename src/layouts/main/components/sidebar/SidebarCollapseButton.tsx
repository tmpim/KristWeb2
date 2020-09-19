import React from "react";

import Navbar from "react-bootstrap/Navbar";

import "./SidebarCollapseButton.scss";

interface Props {
  onCollapseSidebar: () => void;
}

export const SidebarCollapseButton: React.FC<Props> = ({ onCollapseSidebar }: Props): JSX.Element => {
  return (
    <Navbar.Toggle 
      onClick={onCollapseSidebar}
    />
  );
};

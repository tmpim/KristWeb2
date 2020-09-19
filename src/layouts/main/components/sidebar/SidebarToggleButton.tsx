import React from "react";

import Navbar from "react-bootstrap/Navbar";

import "./SidebarToggleButton.scss";

interface Props {
  toggleSidebar: () => void;
}

export const SidebarToggleButton: React.FC<Props> = ({ toggleSidebar }: Props): JSX.Element => {
  return (
    <Navbar.Toggle 
      onClick={toggleSidebar}
    />
  );
};

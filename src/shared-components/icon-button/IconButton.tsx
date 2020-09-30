import React, { PropsWithChildren } from "react";

import Button, { ButtonProps } from "react-bootstrap/Button";

import "./IconButton.scss";

export interface Props extends ButtonProps {
  icon?: string;
  openDialog?: () => void;
}

export const IconButton: React.FC<Props> = ({ openDialog, ...props }: PropsWithChildren<Props>) => {
  return <Button as="a" onClick={openDialog} {...props}>
    {props.icon && <span className={`btn-icon icon-${props.icon}`}></span>}
    {props.children}
  </Button>;
};

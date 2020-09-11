import React, { PropsWithChildren } from "react";

import Button, { ButtonProps } from "react-bootstrap/Button";

import "./index.scss";

interface Props extends ButtonProps {
  icon: string;
}

export const IconButton: React.FC<Props> = (props: PropsWithChildren<Props>) => {
  return <Button {...props}>
    <span className={`btn-icon icon-${props.icon}`}></span>
    {props.children}
  </Button>;
};

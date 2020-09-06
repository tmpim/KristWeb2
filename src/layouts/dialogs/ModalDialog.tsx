import React, { PropsWithChildren, ReactNode } from "react";

import Modal from "react-bootstrap/Modal";
import { CloseButton } from "./utils/CloseButton";

import { noop } from "@utils";

type Props = {
  show: boolean;

  title: string;

  handleClose?: () => void;
  hasCloseButton?: boolean;
  hasFooterCloseButton?: boolean;

  buttons?: ReactNode;
}

export const ModalDialog: React.FC<Props> = (props: PropsWithChildren<Props>) => { 
  if ((props.hasCloseButton || props.hasFooterCloseButton) && !props.handleClose)
    throw new Error("ModalDialog has close button but no close handler");

  return (
    /* TODO: Animation is disabled for now, because react-bootstrap (or more
      specifically, react-transition-group) has an incompatibility with
      strict mode. */
    <Modal 
      show={props.show} centered animation={false} // TODO
      onHide={props.handleClose}
    >
      <Modal.Header closeButton={props.hasCloseButton}>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Custom modal body */}
        {props.children}
      </Modal.Body>
      <Modal.Footer>
        {/* Display the footer close button if we were asked to */}
        {props.hasFooterCloseButton && <CloseButton handleClose={props.handleClose || noop} />}

        {/* Display the custom buttons if provided */}
        {props.buttons}
      </Modal.Footer>
    </Modal>
  );
};

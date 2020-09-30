import React, { Component, ReactElement, ReactNode } from "react";

import Modal from "react-bootstrap/Modal";
import { CloseButton } from "./utils/CloseButton";

import { Form, Formik, FormikHelpers, FormikProps, FormikValues } from "formik";

import { isFunction, noop } from "@utils";

interface Props<V extends FormikValues = FormikValues> {
  show: boolean;

  title: string;

  handleClose?: () => void;
  hasCloseButton?: boolean;
  hasFooterCloseButton?: boolean;

  buttons?: ((props: FormikProps<V>) => React.ReactNode) | React.ReactNode;

  initialValues?: V;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit?: (values: V, formikHelpers: FormikHelpers<V>) => void | Promise<any>;
  children?: ((props: FormikProps<V>) => React.ReactNode) | React.ReactNode;
}

export class ModalDialog<V extends FormikValues = FormikValues> extends Component<Props<V>> {
  render(): ReactNode {
    const { 
      hasCloseButton, hasFooterCloseButton, handleClose, // Close button
      show, title, // Modal state and title
      children, buttons, // Actual contents
      initialValues, onSubmit // Form nonsense
    } = this.props;

    if ((hasCloseButton || hasFooterCloseButton) && !handleClose)
      throw new Error("FormDialog has close button but no close handler");

    // The contents of the modal (header, body, footer), which may or may not
    // be wrapped in a form.
    const modalContents = (formikBag?: FormikProps<V>) => <>
      <Modal.Header closeButton={hasCloseButton}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Custom modal body */}
        {isFunction(children) && formikBag
          ? (children as (bag: FormikProps<V>) => React.ReactNode)(formikBag)
          : children}
      </Modal.Body>
      <Modal.Footer>
        {/* Display the footer close button if we were asked to */}
        {hasFooterCloseButton && <CloseButton handleClose={handleClose || noop} />}

        {/* Display the custom buttons if provided */}
        {isFunction(buttons) && formikBag
          ? (buttons as (bag: FormikProps<V>) => React.ReactNode)(formikBag)
          : buttons}
      </Modal.Footer>
    </>;

    return (
      /* TODO: Animation is disabled for now, because react-bootstrap (or more
        specifically, react-transition-group) has an incompatibility with
        strict mode. */
      <Modal 
        show={show} centered animation={false} // TODO
        onHide={handleClose}
      >
        {initialValues && onSubmit 
          /* If this is a form, wrap the contents in Formik: */
          ? <Formik 
            initialValues={initialValues}
            onSubmit={onSubmit}>
            {(formikBag) => 
              <Form noValidate onSubmit={formikBag.handleSubmit}>
                {modalContents(formikBag)}
              </Form>
            }
          </Formik>
          /* Otherwise, render the contents directly: */
          : modalContents()}
      </Modal>
    );
  }
};

export interface WithDialogLink {
  openDialog?: () => void;
}

interface DialogLinkState {
  show: boolean;
}

export const withDialogLink = (renderDialog: (show: boolean, handleClose: () => void) => ReactElement<ModalDialog>) =>
  <P extends WithDialogLink>(Component: React.ComponentType<P>): React.ComponentType<P> =>
    class WrappedDialogLink extends React.Component<P, DialogLinkState> {
      constructor(props: P) {
        super(props);
        
        this.state = {
          show: false
        };
      }

      openDialog = () => this.setState({ show: true });
      closeDialog = () => this.setState({ show: false });

      render() {
        const { show } = this.state;

        return <>
          <Component 
            {...this.props as P} 
            onClick={this.openDialog}
            openDialog={this.openDialog}
          />
          {renderDialog(show, this.closeDialog)}
        </>;
      }
    };

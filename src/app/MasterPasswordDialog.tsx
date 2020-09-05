import React, { Component } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

export class MasterPasswordDialog extends Component {
  render(): JSX.Element {
    return (
      /* TODO: Animation is disabled for now, because react-bootstrap (or more
        specifically, react-transition-group) has an incompatibility with
        strict mode. */
      <Modal show={true} centered animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Master password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter your master password to access your wallets, or browse
            KristWeb as a guest.</p>

          {/* Provide a username field for browser autofill */}
          <Form.Control type="username" value="Master password" readOnly={true} hidden={true} />
          <Form.Control type="password" placeholder="Master password" tabIndex={1} autoFocus={true} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" style={{ marginRight: "auto" }} tabIndex={3}>Browse as guest</Button>
          <Button variant="danger">Forgot password</Button>
          <Button variant="primary" tabIndex={2}>Login</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

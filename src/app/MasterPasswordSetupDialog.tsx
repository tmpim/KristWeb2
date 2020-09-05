import React, { Component, RefObject, SyntheticEvent } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { StorageManager } from "./StorageManager";

interface MasterPasswordSetupDialogProps {
  storageManager: StorageManager;
}

export class MasterPasswordSetupDialog extends Component<MasterPasswordSetupDialogProps> {
  passwordInput: RefObject<HTMLInputElement>;

  constructor(props: MasterPasswordSetupDialogProps) {
    super(props);

    this.passwordInput = React.createRef<HTMLInputElement>();
  }

  onSave(event: SyntheticEvent<EventTarget>): void {
    event.preventDefault();

    if (!this.passwordInput.current)
      throw new Error("passwordInput ref is undefined!");

    const masterPassword = this.passwordInput.current.value;
    this.props.storageManager.setMasterPassword(masterPassword);
  }

  render(): JSX.Element {
    return (
      /* TODO: Animation is disabled for now, because react-bootstrap (or more
        specifically, react-transition-group) has an incompatibility with
        strict mode. */
      <Modal onSubmit={this.onSave.bind(this)} show={true} centered animation={false}>
        <Form>
          <Modal.Header closeButton>
            <Modal.Title>Master password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-0">Enter a master password to encrypt your wallets, 
              or browse KristWeb as a guest.</p>
            <p><small className="text-muted">
              Never forget this password. If you forget it, you will have to 
              create a new one and add all your wallets again.
            </small></p>

            {/* Provide a username field for browser autofill */}
            <Form.Control type="username" value="Master password" readOnly={true} hidden={true} />
            <Form.Control type="password" placeholder="Master password" tabIndex={1} autoFocus={true} ref={this.passwordInput}/>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" style={{ marginRight: "auto" }} tabIndex={3}>Browse as guest</Button>
            <Button type="submit" variant="primary" tabIndex={2}>Create password</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

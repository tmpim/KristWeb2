import React, { Component } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { Formik, FormikHelpers } from "formik";

import { HelpWalletStorageLink } from "./HelpWalletStorageDialog";

import { WalletManager } from "../../app/WalletManager";

interface MasterPasswordDialogProps {
  hasMasterPassword: boolean;
  walletManager: WalletManager;
}

interface FormValues {
  password: string;
}

export class MasterPasswordDialog extends Component<MasterPasswordDialogProps> {
  async onSubmit({ password }: FormValues, helpers: FormikHelpers<FormValues>): Promise<void> {
    try {
      if (typeof password !== "string" || password.length === 0) 
        throw new Error("Password is required.");

      const { hasMasterPassword, walletManager } = this.props;

      if (hasMasterPassword) // Attempt login
        await walletManager.testMasterPassword(password);
      else // Setup a new master password
        await walletManager.setMasterPassword(password);
    } catch (e) { // Catch any errors (usually 'invalid password') and display
      helpers.setSubmitting(false);
      helpers.setErrors({ password: e.message || "Unknown error." });
      console.error(e);
    }
  }

  browseAsGuest(): void {
    this.props.walletManager.browseAsGuest();
  }

  render(): JSX.Element {
    const { hasMasterPassword } = this.props;
    const body = hasMasterPassword
      ? <p>Enter your master password to access your wallets, or browse
      KristWeb as a guest.</p>
      : <>
        <p className="mb-0">
          Enter a master password to encrypt your wallets, or browse KristWeb 
          as a guest <HelpWalletStorageLink />. 
        </p>
        <p><small className="text-muted">
          Never forget this password. If you forget it, you will have to 
          create a new one and add all your wallets again.
        </small></p>
      </>;

    return (
      <Modal 
        show={true} centered animation={false}
        onHide={this.browseAsGuest.bind(this)}
      >
        <Formik initialValues={{ password: "" }} onSubmit={this.onSubmit.bind(this)}>
          {({ handleSubmit, handleChange, values, errors, isSubmitting }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>Master password</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {/* Embed the body text, which depends on whether or not this is 
                    the first time setting up a master password. */}
                {body}

                {/* Provide a username field for browser autofill */}
                <Form.Control type="username" value="Master password" readOnly={true} hidden={true} />

                {/* Password input */}
                <Form.Control 
                  type="password" 
                  name="password"
                  placeholder="Master password" 
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  tabIndex={1} 
                  autoFocus={true}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Modal.Body>
              <Modal.Footer>
                {/* Left side, "Browse as guest" button */}
                <Button 
                  variant="secondary" 
                  style={{ marginRight: "auto" }} 
                  onClick={this.browseAsGuest.bind(this)}
                  tabIndex={3}
                >
                  Browse as guest
                </Button>

                {/* Right side */}
                {hasMasterPassword
                  ? <> {/* They have a master password, show login */}
                    <Button variant="danger">Forgot password</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting} tabIndex={2}>Login</Button>
                  </>
                  : <Button type="submit" variant="primary" disabled={isSubmitting} tabIndex={2}>Create password</Button>
                }
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    );
  }
}

import React, { Component, ReactNode } from "react";

import { withTranslation, WithTranslation, Trans } from "react-i18next";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { Formik, FormikHelpers } from "formik";

import { HelpWalletStorageLink } from "./HelpWalletStorageDialog";

import { Dispatch } from "redux";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "@store";
import { browseAsGuest, login, setMasterPassword } from "@app/WalletManager";

interface OwnProps {
  isLoggedIn: boolean;
  salt?: string;
  tester?: string;
  hasMasterPassword: boolean;
}

const mapStateToProps = (state: RootState): OwnProps => ({
  isLoggedIn: state.walletManager.isLoggedIn,
  salt: state.walletManager.salt,
  tester: state.walletManager.tester,
  hasMasterPassword: state.walletManager.hasMasterPassword
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return { dispatch };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector> & WithTranslation & OwnProps;

interface FormValues {
  password: string;
}

class MasterPasswordDialogComponent extends Component<Props> {
  async onSubmit({ password }: FormValues, helpers: FormikHelpers<FormValues>): Promise<void> {
    const { t } = this.props;

    try {
      if (typeof password !== "string" || password.length === 0) 
        throw new Error("masterPassword.errorPasswordRequired");

      const { dispatch, salt, tester, hasMasterPassword } = this.props;

      if (hasMasterPassword) // Attempt login
        await login(dispatch, salt, tester, password);
      else // Setup a new master password
        await setMasterPassword(dispatch, password);
    } catch (e) { // Catch any errors (usually 'invalid password') and display
      const message = e.message // Translate the error if we can
        ? e.message.startsWith("masterPassword.") ? t(e.message) : e.message
        : t("masterPassword.errorUnknown");

      helpers.setSubmitting(false);
      helpers.setErrors({ password: message });
      console.error(message, e);
    }
  }

  browseAsGuest(): void {
    browseAsGuest(this.props.dispatch);
  }

  render(): ReactNode {
    const { t } = this.props;

    // Don't show the dialog if we're already logged in
    if (this.props.isLoggedIn) return null;

    const { hasMasterPassword } = this.props;
    const body = hasMasterPassword
      ? <p>{t("masterPassword.loginIntro")}</p>
      : <>
        <p className="mb-0">
          <Trans t={t} i18nKey="masterPassword.intro">
            Enter a master password to encrypt your wallets, or browse KristWeb 
            as a guest <HelpWalletStorageLink />. 
          </Trans>
        </p>
        <p><small className="text-muted">
          {t("masterPassword.dontForgetPassword")}
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
                <Modal.Title>{t("masterPassword.dialogTitle")}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {/* Embed the body text, which depends on whether or not this is 
                    the first time setting up a master password. */}
                {body}

                {/* Provide a username field for browser autofill */}
                <Form.Control 
                  type="username"
                  value="Master password" /* Do not translate */
                  readOnly={true} 
                  hidden={true} 
                />

                {/* Password input */}
                <Form.Control 
                  type="password" 
                  name="password"
                  placeholder={t("masterPassword.passwordPlaceholder")}
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
                  {t("masterPassword.browseAsGuest")}
                </Button>

                {/* Right side */}
                {hasMasterPassword
                  ? <> {/* They have a master password, show login */}
                    <Button variant="danger">{t("masterPassword.forgotPassword")}</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting} tabIndex={2}>
                      {t("masterPassword.logIn")}
                    </Button>
                  </>
                  : (
                    <Button type="submit" variant="primary" disabled={isSubmitting} tabIndex={2}>
                      {t("masterPassword.createPassword")}
                    </Button>
                  )
                }
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    );
  }
}

export const MasterPasswordDialog = withTranslation()(connector(MasterPasswordDialogComponent));

import React, { Component } from "react";

import { withTranslation, WithTranslation } from "react-i18next";

import { IconButton } from "@components/icon-button/IconButton";
import Form from "react-bootstrap/Form";
import { FormikHelpers } from "formik";
import { Highlighter, Typeahead } from "react-bootstrap-typeahead";

import { ModalDialog, withDialogLink } from "./ModalDialog";

import { WalletFormatName } from "@krist/wallets/formats/WalletFormat";

import { noop } from "@utils";

export const AddWalletButton = withDialogLink(
  (show, handleClose) => 
    <AddWalletDialog show={show} handleClose={handleClose} create={false} />
)(IconButton);

export const CreateWalletButton = withDialogLink(
  (show, handleClose) => 
    <AddWalletDialog show={show} handleClose={handleClose} create={true} />
)(IconButton);

interface OwnProps {
  show: boolean;
  handleClose: () => void;

  /** If true, show the 'create wallet' dialog instead of the 'add wallet'
   * dialog. */
  create?: boolean;
}
type Props = OwnProps & WithTranslation;

interface FormValues {
  label?: string;
  category: string;
  password: string;
  format: WalletFormatName;
}

class AddWalletDialogComponent extends Component<Props> {
  async onSubmit(values: FormValues, helpers: FormikHelpers<FormValues>): Promise<void> {
  }

  render() {
    const { show, handleClose, create, t } = this.props;

    return <ModalDialog<FormValues>
      show={show}
      handleClose={handleClose}
      hasCloseButton={true}
      hasFooterCloseButton={true}
      title={t(create ? "addWallet.dialogTitleCreate" : "addWallet.dialogTitle")}
      initialValues={{
        label: "",
        category: "",
        password: "",
        format: "kristwallet"
      }}
      onSubmit={this.onSubmit.bind(this)}
    >
      {({ handleChange, values, errors, setFieldValue }) => <>
        {/* Wallet label */}
        <Form.Group>
          <Form.Label>{t("addWallet.walletLabel")}</Form.Label>
          <Form.Control 
            type="text" 
            name="label"
            placeholder={t("addWallet.walletLabelPlaceholder")} 
            value={values.label}
            onChange={handleChange}
            isInvalid={!!errors.label}
            tabIndex={1}
          />
        </Form.Group>
        <Form.Control.Feedback type="invalid">{errors.label}</Form.Control.Feedback>

        {/* Category dropdown */}
        <Form.Group>
          <Form.Label>{t("addWallet.walletCategory")}</Form.Label>
          <Typeahead
            id="category"
            options={["", "Test category"]}
            defaultSelected={[""]}
            /*selected={[values.category]}*/
            placeholder={t("addWallet.walletCategoryDropdownNone")}
            onChange={selected => setFieldValue("category", selected[0] || "")}
            onInputChange={text => setFieldValue("category", text)}
            isInvalid={!!errors.category}
            renderMenuItemChildren={(option, { text }) => 
              option === "" // Show the "No category" text
                ? <span className="text-muted">{t("addWallet.walletCategoryDropdownNone")}</span>
                : <Highlighter search={text}>{option}</Highlighter>
            }
          />
        </Form.Group>
        <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
      </>}
    </ModalDialog>;
  }
};

export const AddWalletDialog = withTranslation()(AddWalletDialogComponent);

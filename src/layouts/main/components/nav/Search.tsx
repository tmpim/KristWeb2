import React from "react";

import { useTranslation } from "react-i18next";

import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import "./Search.scss";

export const Search = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Form inline id="main-nav-search">
      <FormControl type="text" placeholder={t("nav.search")} />
    </Form>
  );
};

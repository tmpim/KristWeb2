import React from "react";

import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import "./Search.scss";

export const Search = (): JSX.Element => (
  <Form inline id="main-nav-search">
    <FormControl type="text" placeholder="Search the Krist network" />
  </Form>
);
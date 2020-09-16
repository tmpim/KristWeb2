import React from "react";

import Form from "react-bootstrap/Form";

import "./SearchTextbox.scss";

interface Props {
  placeholder: string;
}

export const SearchTextbox: React.FC<Props> = (props: Props) => (
  <Form.Control type="text" placeholder={props.placeholder} className="list-view-search-textbox" />
);

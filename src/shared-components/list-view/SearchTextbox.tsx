import React from "react";

import Form from "react-bootstrap/Form";

interface Props {
  placeholder: string;
}

export const SearchTextbox: React.FC<Props> = (props: Props) => {
  return <Form.Control type="text" placeholder={props.placeholder} />;
};

import React from "react";

import Form from "react-bootstrap/Form";

interface Props {
  /** `options` is a map representing the form value and the human-readable
   * text to display it. This map is ordered by insertion order. */
  options: Map<string, string>;
}

export const FilterSelect: React.FC<Props> = (props: Props) => (
  <Form.Control as="select" custom>
    {/* Insert each select option as an <option> element */}
    {Array.from(props.options, ([formValue, text]) =>
      /* formValue is the key of the select provided to the form, text is the
         human-readable name for it. */
      <option value={formValue}>{text}</option>)}
  </Form.Control>
);

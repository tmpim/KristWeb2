import React from "react";

import Form from "react-bootstrap/Form";

import "./FilterSelect.scss";

interface Props {
  /** `options` is a map representing the form value and the human-readable
   * text to display it. This map is ordered by insertion order. */
  options: Map<string, string>;
}

export const FilterSelect: React.FC<Props> = (props: Props) => (
  <Form.Control as="select" custom className="list-view-filter-select">
    {/* Insert each select option as an <option> element */}
    {Array.from(props.options, ([formValue, text]) =>
      /* formValue is the key of the select provided to the form, text is the
         human-readable name for it. */
      <option key={formValue} value={formValue}>{text}</option>)}
  </Form.Control>
);

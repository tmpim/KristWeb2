import React, { ReactNode, Component, createRef, ChangeEvent } from "react";

import { withTranslation, WithTranslation } from "react-i18next";

import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import FormControl from "react-bootstrap/FormControl";

import "./ListPagination.scss";

interface OwnProps {
  defaultPage: number;
  pages: number;
}

type Props = WithTranslation & OwnProps;

interface State {
  focus: boolean;
  value: string;
}

class ListPaginationComponent extends Component<Props, State> {
  private textInput = createRef<HTMLInputElement>();
  private selected = false;

  constructor(props: Props) {
    super(props);

    this.state = { 
      focus: false,
      value: this.props.defaultPage.toString()
    };
  }

  private handleFocus() {
    // First of all, assign the focus (triggering re-render)
    this.setState({ focus: true });
  }

  private handleUnfocus() {
    // First of all, unassign the focus (triggering re-render)
    this.setState({ focus: false });
    this.selected = false;
  }

  private handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!this.state.focus) return; // Don't care if not focused (it was us)

    const attemptedValue = event.target.value; 
    if (!attemptedValue.match(/^[0-9]+$/)) return; // Ensure it's a number

    const value = Math.min(Math.max(parseInt(attemptedValue), 1), this.props.pages).toString();

    // Let the user actually type in the input
    this.setState({ value });
  }

  componentDidUpdate(): void {
    // Highlight the text in the input if we just focused it
    const input = this.textInput.current;
    if (this.state.focus && input && !this.selected) {
      this.selected = true;
      input.select();
      input.setSelectionRange(0, input.value.length);
    }
  }

  private getFriendlyText() {
    const { t } = this.props;
    const pageNumber = parseInt(this.state.value);
    return t("pagination.pageWithTotal", { 
      page: pageNumber.toLocaleString(), 
      total: this.props.pages.toLocaleString() 
    });
  }

  render(): ReactNode {
    return (
      <InputGroup className="list-view-pagination">
        {/* Group the prev/next buttons with the page text/input */}
        {/* Prev button */}
        <InputGroup.Prepend>
          <Button variant="secondary"><span className="icon-left-open"></span></Button>
        </InputGroup.Prepend>

        {/* Used to contain the real input and the fake input */}
        <div className="list-view-pagination-inner">
          {/* Dummy text used to auto-grow the input */}
          <span className="form-control list-view-pagination-grower hidden">
            {this.getFriendlyText()}
          </span>
    
          {/* Page number input */}
          <FormControl 
            type="text"
            pattern="[0-9]*" /* iOS, Firefox */
            inputMode="numeric" /* Chrome */
            value={this.state.focus ? this.state.value : this.getFriendlyText()}
            onChange={this.handleChange.bind(this)}
            onFocus={this.handleFocus.bind(this)}
            onBlur={this.handleUnfocus.bind(this)}
            ref={this.textInput}
          />
        </div>
  
        {/* Next button */}
        <InputGroup.Append>
          <Button variant="secondary"><span className="icon-right-open"></span></Button>
        </InputGroup.Append>    
      </InputGroup>
    );
  }
};

export const ListPagination = withTranslation()(ListPaginationComponent);

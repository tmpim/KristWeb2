import React from "react";

import "./GuestIndicator.scss";

import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { openLogin } from "@actions/WalletManagerActions";

const mapDispatchToProps = (dispatch: Dispatch) => 
  bindActionCreators({ openLogin }, dispatch);
  
type Props = ReturnType<typeof mapDispatchToProps>;

const GuestIndicatorComponent: React.FC<Props> = (props: Props) => (
  // Allow clicking the guest indicator to open the master password dialog again
  // eslint-disable-next-line react/prop-types
  <div className="nav-guest-indicator" onClick={() => { props.openLogin(); }}>Browsing as guest</div>
);

export const GuestIndicator = connect(null, mapDispatchToProps)(GuestIndicatorComponent);

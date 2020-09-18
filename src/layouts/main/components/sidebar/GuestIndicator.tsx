import React from "react";

import { useTranslation } from "react-i18next";

import "./GuestIndicator.scss";

import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { openLogin } from "@actions/WalletManagerActions";

const mapDispatchToProps = (dispatch: Dispatch) => 
  bindActionCreators({ openLogin }, dispatch);
  
type Props = ReturnType<typeof mapDispatchToProps>;

const GuestIndicatorComponent: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  // Allow clicking the guest indicator to open the master password dialog again
  return ( // eslint-disable-next-line react/prop-types
    <div className="nav-guest-indicator" onClick={() => { props.openLogin(); }}>
      {t("sidebar.guestIndicator")}
    </div>
  );
};

export const GuestIndicator = connect(null, mapDispatchToProps)(GuestIndicatorComponent);

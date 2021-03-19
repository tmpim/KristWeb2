// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import classNames from "classnames";
import Icon from "@ant-design/icons";

export const VerifiedCheckSvg = (): JSX.Element => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="64 64 896 896">
    <path d="M 912,190 H 730.1 c -9.8,0 -19.1,4.5 -25.1,12.2 L 400,596.5 321,474 c -6.05921,-7.69301 -15.30734,-12.18812 -25.1,-12.2 H 112 c -6.7,0 -10.4,7.7 -6.3,12.9 l 273.9,347 c 12.8,16.2 37.4,16.2 50.3,0 L 918.3,202.8 c 4.1,-5.1 0.4,-12.8 -6.3,-12.8 z" />
  </svg>
);
export const VerifiedCheck = ({ className, ...props }: any): JSX.Element =>
  <Icon
    component={VerifiedCheckSvg}
    className={classNames("kw-verified-check-icon", className)}
    {...props}
  />;

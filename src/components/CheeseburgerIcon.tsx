// Copyright (c) 2020-2023 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import Icon from "@ant-design/icons";

export const CheeseburgerIconSvg = (): JSX.Element => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 224.9 224.9">
    <path
      d="M39.688 205.05a19.844 19.844 0 0 0-19.844 19.844 19.844 19.844 0 0 0 19.844 19.844h185.21a19.844 19.844 0 0 0 19.844-19.844 19.844 19.844 0 0 0-19.844-19.844zm0-79.375a19.844 19.844 0 0 0-19.844 19.844 19.844 19.844 0 0 0 19.844 19.844h25.799l15.715 20.964a4.147 4.147 0 0 0 5.818.833l29.076-21.797h108.8a19.844 19.844 0 0 0 19.844-19.844 19.844 19.844 0 0 0-19.844-19.844zm0-79.375a19.844 19.844 0 0 0-19.844 19.844 19.844 19.844 0 0 0 19.844 19.844h185.21a19.844 19.844 0 0 0 19.844-19.844A19.844 19.844 0 0 0 224.898 46.3z"
      transform="translate(-19.844 -33.072)"
    />
  </svg>
);
export const CheeseburgerIcon = (props: any): JSX.Element =>
  <Icon component={CheeseburgerIconSvg} {...props} />;

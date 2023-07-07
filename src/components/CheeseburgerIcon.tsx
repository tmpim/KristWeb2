// Copyright (c) 2020-2023 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import Icon from "@ant-design/icons";

export const CheeseburgerIconSvg = (): JSX.Element => (
  <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 224.9 224.9">
    <path
      d="M39.687 205.05c-10.959 0-19.844 8.884-19.844 19.844s8.884 19.844 19.844 19.844h185.21c10.959 0 19.844-8.884 19.844-19.844s-8.884-19.844-19.844-19.844zm0-72.761c-10.959 0-19.844 8.884-19.844 19.844s8.884 19.844 19.844 19.844h25.799l15.715 20.964a4.147 4.147 0 0 0 5.818.833l29.076-21.797h108.8c10.96 0 19.844-8.885 19.844-19.844s-8.884-19.844-19.844-19.844zm92.578-92.604c-39.601.004-112.42 8.438-112.42 39.7 0 10.959 8.884 19.844 19.844 19.844h185.21c10.959 0 19.844-8.884 19.844-19.844 0-31.262-72.848-39.697-112.45-39.7z"
      transform="translate(-19.844 -29.766)"
    />
  </svg>
);
export const CheeseburgerIcon = (props: any): JSX.Element =>
  <Icon component={CheeseburgerIconSvg} {...props} />;

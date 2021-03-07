// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React from "react";
import { Tag } from "antd";

import { useTranslation } from "react-i18next";

import semverMajor from "semver/functions/major";
import semverMinor from "semver/functions/minor";
import semverPatch from "semver/functions/patch";
import semverPrerelease from "semver/functions/prerelease";

import { ConditionalLink } from "@comp/ConditionalLink";

import packageJson from "../../../package.json";

const prereleaseTagColours: { [key: string]: string } = {
  "dev": "red",
  "alpha": "orange",
  "beta": "blue",
  "rc": "green"
};

export function Brand(): JSX.Element {
  const { t } = useTranslation();

  const version = packageJson.version;

  const major = semverMajor(version);
  const minor = semverMinor(version);
  const patch = semverPatch(version);
  const prerelease = semverPrerelease(version);

  // Convert semver prerelease parts to Bootstrap badge
  let tag = null;
  if (prerelease && prerelease.length) {
    const variant = prereleaseTagColours[prerelease[0]] || undefined;
    tag = <Tag color={variant}>{prerelease.join(".")}</Tag>;
  }

  return <div className="site-header-brand">
    <ConditionalLink to="/" matchTo matchExact>
      {t("app.name")}
      <span className="site-header-brand-version">v{major}.{minor}.{patch}</span>
      {tag}
    </ConditionalLink>
  </div>;
}

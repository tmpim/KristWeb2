// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { Tag } from "antd";

import { useTranslation } from "react-i18next";

import semverMajor from "semver/functions/major";
import semverMinor from "semver/functions/minor";
import semverPatch from "semver/functions/patch";
import semverPrerelease from "semver/functions/prerelease";

import { ConditionalLink } from "@comp/ConditionalLink";

import { getDevState } from "@utils";

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

  const { isDirty, isDev } = getDevState();

  // Convert semver prerelease parts to Bootstrap badge
  const tagContents = isDirty || isDev ? ["dev"] : prerelease;
  let tag = null;
  if (tagContents && tagContents.length) {
    const variant = prereleaseTagColours[tagContents[0]] || undefined;
    tag = <Tag color={variant}>{tagContents.join(".")}</Tag>;
  }

  return <div className="site-header-brand">
    <ConditionalLink to="/" matchTo matchExact>
      <img src="/logo.svg" className="logo" />
      {t("app.name")}
      <span className="site-header-brand-version">v{major}.{minor}.{patch}</span>
      {tag}
    </ConditionalLink>
  </div>;
}

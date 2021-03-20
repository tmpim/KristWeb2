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

import packageJson from "../../../package.json";

declare const __GIT_VERSION__: string;

const prereleaseTagColours: { [key: string]: string } = {
  "dev": "red",
  "alpha": "orange",
  "beta": "blue",
  "rc": "green"
};

const devEnvs = ["development", "local", "test"];
const dirtyRegex = /-dirty$/;

export function Brand(): JSX.Element {
  const { t } = useTranslation();

  const version = packageJson.version;

  const major = semverMajor(version);
  const minor = semverMinor(version);
  const patch = semverPatch(version);
  const prerelease = semverPrerelease(version);

  // Determine if the 'dev' tag should be shown
  // Replaced by webpack DefinePlugin and git-revision-webpack-plugin
  const gitVersion: string = __GIT_VERSION__;
  const isDirty = dirtyRegex.test(gitVersion);
  const isDev = devEnvs.includes(process.env.NODE_ENV || "development");

  // Convert semver prerelease parts to Bootstrap badge
  const tagContents = isDirty || isDev ? ["dev"] : prerelease;
  let tag = null;
  if (tagContents && tagContents.length) {
    const variant = prereleaseTagColours[tagContents[0]] || undefined;
    tag = <Tag color={variant}>{tagContents.join(".")}</Tag>;
  }

  return <div className="site-header-brand">
    <ConditionalLink to="/" matchTo matchExact>
      {t("app.name")}
      <span className="site-header-brand-version">v{major}.{minor}.{patch}</span>
      {tag}
    </ConditionalLink>
  </div>;
}

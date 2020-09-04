import React from "react";

import semverMajor from "semver/functions/major";
import semverMinor from "semver/functions/minor";
import semverPatch from "semver/functions/patch";
import semverPrerelease from "semver/functions/prerelease";

import Badge from "react-bootstrap/Badge";

import "./Brand.scss";

import packageJson from "@/package.json";

const prereleaseTagColours: { [key: string]: string } = {
  "dev": "danger",
  "alpha": "warning",
  "beta": "info",
  "rc": "success"
};

export const Brand = (): JSX.Element => {
  const version = packageJson.version;

  const major = semverMajor(version);
  const minor = semverMinor(version);
  const patch = semverPatch(version);
  const prerelease = semverPrerelease(version);

  // Convert semver prerelease parts to Bootstrap badge
  let badge = null;
  if (prerelease && prerelease.length) {
    const variant = prereleaseTagColours[prerelease[0]] || "light";
    badge = <Badge variant={variant}>{prerelease.join(".")}</Badge>;
  }

  return (
    <div className="navbar-brand">
      <a href="/">
        KristWeb
        <span className="navbar-version">v{major}.{minor}.{patch}</span>
        {badge}
      </a>
    </div>
  );
};

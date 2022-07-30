// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
declare const __GIT_VERSION__: string;

const devEnvs = ["development", "local", "test"];
const dirtyRegex = /-dirty$/;

interface DevState {
  gitVersion: string;
  isDirty: boolean;
  isDev: boolean;
}

export function getDevState(): DevState {
  // Determine if the 'dev' tag should be shown
  // Replaced by webpack DefinePlugin and git-revision-webpack-plugin
  const gitVersion: string = __GIT_VERSION__;
  const isDirty = dirtyRegex.test(gitVersion);
  const isDev = devEnvs.includes(process.env.NODE_ENV || "development");

  return { gitVersion, isDirty, isDev };
}

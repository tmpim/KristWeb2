

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

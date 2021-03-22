// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import Debug from "debug";

const window = { localStorage: { debug: "kristweb:*" }};
const debug = Debug("kristweb:storage-worker");

export async function foo(test: string): Promise<string> {
  debug("sw debug");
  return "1251512" + test;
}

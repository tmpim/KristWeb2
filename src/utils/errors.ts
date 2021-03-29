// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

declare const __GIT_VERSION__: string;
const gitVersion: string = __GIT_VERSION__;

Sentry.init({
  dsn: "https://51a018424102449b88f94c795cf62bb7@sentry.lemmmy.pw/2",
  release: "kristweb2-react@" + gitVersion,
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
});

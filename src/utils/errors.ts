// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import * as Sentry from "@sentry/react";
import { CaptureContext } from "@sentry/types";
import { Integrations } from "@sentry/tracing";

import { message } from "antd";

declare const __GIT_VERSION__: string;
const gitVersion: string = __GIT_VERSION__;

const ls = localStorage.getItem("settings.errorReporting");
export const errorReporting = process.env.DISABLE_SENTRY !== "true" &&
  (ls === null || ls === "true");
export const messageOnErrorReport = localStorage.getItem("settings.messageOnErrorReport") === "true";

Sentry.init({
  dsn: errorReporting
    ? "https://51a018424102449b88f94c795cf62bb7@sentry.lemmmy.pw/2"
    : undefined,
  release: "kristweb2-react@" + gitVersion,
  integrations: [new Integrations.BrowserTracing()],

  // Disable Sentry error reporting if the setting is disabled:
  tracesSampleRate: errorReporting ? 0.2 : 0,

  beforeSend(event) {
    // Don't send an error event if error reporting is disabled
    if (!errorReporting) return null;

    // Show a message on report if the setting is enabled
    if (messageOnErrorReport) {
      // TODO: Find a way to translate this, while still ensuring that this file
      //       is imported before everything else.
      message.info("An error was automatically reported. See console for details.");
    }

    return event;
  },

  beforeBreadcrumb(breadcrumb) {
    // Don't send a breadcrumb event if error reporting is disabled
    if (!errorReporting) return null;
    return breadcrumb;
  }
});

export function criticalError(
  err: Error | string,
  captureContext?: CaptureContext
): void {
  Sentry.captureException(err, captureContext);
  console.error(err);
}

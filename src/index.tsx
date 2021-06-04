// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import "@utils/errors";
import "@utils/setup";
import { i18nLoader } from "@utils/i18n";
import { isLocalhost, criticalError } from "@utils";

import ReactDOM from "react-dom";

import { compatCheck } from "@global/compat";
import { notification } from "antd";

import "./index.css";
import App from "@app";

import Debug from "debug";
const debug = Debug("kristweb:index");

async function main() {
  debug("=========================== APP STARTING ===========================");
  debug("performing compat checks");
  await compatCheck();

  // if (isLocalhost && !localStorage.getItem("status")) {
  //   // Automatically enable debug logging on localhost
  //   localStorage.setItem("debug", "kristweb:*");
  //   localStorage.setItem("status", "LOCAL");
  //   location.reload();
  // }

  debug("waiting for i18n");
  await i18nLoader;

  initialRender();
}

function initialRender() {
  debug("performing initial render");
  ReactDOM.render(
    // FIXME: ant-design still has a few incompatibilities with StrictMode, most
    //        notably in rc-menu. Keep an eye on the issue to track progress and
    //        prepare for React 17:
    //        https://github.com/ant-design/ant-design/issues/26136
    // <React.StrictMode>
    <App />,
    // </React.StrictMode>,
    document.getElementById("root")
  );
}

main().catch(err => {
  // Remove the preloader
  document.getElementById("kw-preloader")?.remove();

  // Don't show the notification if a modal is already being shown
  if (err?.message === "compat checks failed") return;

  debug("critical error in index.tsx");
  criticalError(err);

  notification.error({
    message: "Critical error",
    description: "A critical startup error has occurred. Please report this on GitHub. See console for details."
  });
});

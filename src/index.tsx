// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import "./utils/setup";
import { i18nLoader } from "./utils/i18n";

import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";

import Debug from "debug";
const debug = Debug("kristweb:index");

// import reportWebVitals from "./reportWebVitals";

debug("============================ APP STARTING ============================");
debug("waiting for i18n first");
i18nLoader.then(() => {
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
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

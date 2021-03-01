// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import "./utils/setup";

import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App";

import Debug from "debug";
const debug = Debug("kristweb:index");

// import reportWebVitals from "./reportWebVitals";

debug("============================ APP STARTING ============================");
debug("performing initial render");
ReactDOM.render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import "./utils/setup"; // Set up service worker and some libs

import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import { App } from "./app/App";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

import React from "react";

import "./Footer.scss";

import packageJson from "@/package.json";

// Find host.json
const req = require.context("@/", false, /\.\/host.json$/);

export default function() {
  const gitURL = packageJson.repository.url.replace(/\.git$/, "");

  // Add the host information if host.json exists
  let host;
  if (req.keys().includes("./host.json")) {
    host = req("./host.json");
  }

  return (
    <div className="sidebar-footer">
      <div>
        Made by <a href="https://github.com/Lemmmy">Lemmmy</a>
      </div>
      { host && 
        <div>
          Hosted by <a href={host.url}>{host.name}</a>
        </div>
      }
      <div>
        <a href={gitURL}>GitHub</a>
        &nbsp;&ndash;&nbsp;
        <a href={gitURL + "/commits"}>Changelog</a>
      </div>
    </div>
  )
}
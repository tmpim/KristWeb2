import React from "react";

import "./Footer.scss";

import packageJson from "@/package.json";
import { Link } from "react-router-dom";

// Find host.json
const req = require.context("@/", false, /\.\/host.json$/);

export const Footer = (): JSX.Element => {
  const authorName = packageJson.author || "Lemmmy";
  const authorURL = `https://github.com/${authorName}`;
  const gitURL = packageJson.repository.url.replace(/\.git$/, "");

  // Add the host information if host.json exists
  let host;
  if (req.keys().includes("./host.json")) {
    host = req("./host.json");
  }

  return (
    <div className="sidebar-footer">
      <div>
        Made by <a href={authorURL} target="_blank" rel="noopener noreferrer">{authorName}</a>
      </div>
      { host && 
        <div>
          Hosted by <a href={host.url} target="_blank" rel="noopener noreferrer">{host.name}</a>
        </div>
      }
      <div>
        <a href={gitURL} target="_blank" rel="noopener noreferrer">GitHub</a>
        &nbsp;&ndash;&nbsp;
        <Link to="/credits">Credits</Link>
      </div>
    </div>
  );
};

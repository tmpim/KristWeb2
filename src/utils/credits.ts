// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { useState } from "react";
import { useMountEffect } from "./";
import packageJson from "../../package.json";

export function getAuthorInfo(): { authorName: string; authorURL: string; gitURL: string } {
  const authorName = packageJson.author || "Lemmmy";
  const authorURL = `https://github.com/${authorName}`;
  const gitURL = packageJson.repository.url.replace(/\.git$/, "");

  return { authorName, authorURL, gitURL };
}

export interface HostInfo {
  host: {
    name: string;
    url: string;
  };
}

export function useHostInfo(): HostInfo | undefined {
  const [host, setHost] = useState<HostInfo | undefined>();

  useMountEffect(() => {
    (async () => {
      try {
        // Add the host information if host.json exists
        const hostFile = "host-attribution"; // Trick webpack into dynamic importing
        const hostData = await import("../__data__/" + hostFile + ".json");
        setHost(hostData);
      } catch (ignored) {
        // Ignored
      }
    })();
  });

  return host;
}

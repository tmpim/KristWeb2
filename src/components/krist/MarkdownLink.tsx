// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { FC } from "react";

import { useSyncNode } from "@api";

// Allow overriding a link to make it open in a new tab and start with baseURL.
// This is usually used by the markdown renderers.
export function useMarkdownLink(baseURL?: string): FC<HTMLAnchorElement> {
  // Default for baseURL if not specified
  const syncNode = useSyncNode();
  const base = baseURL || syncNode;

  return ({ title, href, children }) => {
    // Force the link to start with baseURL/syncNode if it's relative
    const absLink = href.startsWith("/")
      ? base + href
      : href;

    return <a
      title={title}
      href={absLink}
      target="_blank" rel="noopener noreferrer"
    >
      {children}
    </a>;
  };
}

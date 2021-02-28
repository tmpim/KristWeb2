// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import packageJson from "../../package.json";

export function getAuthorInfo(): { authorName: string; authorURL: string; gitURL: string } {
  const authorName = packageJson.author || "Lemmmy";
  const authorURL = `https://github.com/${authorName}`;
  const gitURL = packageJson.repository.url.replace(/\.git$/, "");

  return { authorName, authorURL, gitURL };
}

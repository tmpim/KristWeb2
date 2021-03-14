// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt

const gitlog = require("gitlog").default;

// Based on the Krist code
const messageTypeRe = /^(\w+): (.+)/;
function formatCommits(commits) {
  const newCommits = [];

  for (const commit of commits) {
    if (!commit.subject) continue;

    const [, type, rest] = messageTypeRe.exec(commit.subject) || [];
    if (type) {
      commit.type = type;
      commit.subject = rest;
    }

    // Not possible until async is figured out
    // commit.avatar = await getAvatar(commit);

    newCommits.push({
      type: commit.type,
      subject: commit.subject,
      body: commit.body,
      hash: commit.hash,
      authorName: commit.authorName,
      authorEmail: commit.authorEmail,
      // Git dates are not strict ISO-8601 by default
      authorDate: new Date(commit.authorDate).toISOString(),
      authorDateRel: commit.authorDateRel,
      avatar: commit.avatar,
    });
  }

  return newCommits;
}

// This is performed synchronously until I can find a way to do async defines
// in webpack. This unfortunately also means that there won't be any avatars.
const commits = formatCommits(gitlog({
  repo: __dirname,
  number: 5,
  fields: [
    "subject", "body", "hash",
    "authorName", "authorEmail", "authorDate", "authorDateRel"
  ]
}));

module.exports = { commits };

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { getNameRegex } from "./currency";

export interface CommonMeta {
  metaname?: string;
  name?: string;
  recipient?: string;

  return?: string;
  returnMetaname?: string;
  returnName?: string;
  returnRecipient?: string;

  custom: Record<string, string>;
}

export function parseCommonMeta(nameSuffix: string, metadata: string | undefined | null): CommonMeta | null {
  if (!metadata) return null;

  const custom: Record<string, string> = {};
  const out: CommonMeta = { custom };

  const metaParts = metadata.split(";");
  if (metaParts.length <= 0) return null;

  const nameMatches = getNameRegex(nameSuffix).exec(metaParts[0]);
  if (nameMatches) {
    if (nameMatches[1]) out.metaname = nameMatches[1];
    if (nameMatches[2]) out.name = nameMatches[2];

    out.recipient = nameMatches[1] ? nameMatches[1] + "@" + nameMatches[2] : nameMatches[2];
  }

  for (let i = 0; i < metaParts.length; i++) {
    const metaPart = metaParts[i];
    const kv = metaPart.split("=", 2);

    if (i === 0 && nameMatches) continue;

    if (kv.length === 1) {
      custom[i.toString()] = kv[0];
    } else {
      custom[kv[0]] = kv.slice(1).join("=");
    }
  }

  const rawReturn = out.return = custom.return;
  if (rawReturn) {
    const returnMatches = getNameRegex(nameSuffix).exec(rawReturn);
    if (returnMatches) {
      if (returnMatches[1]) out.returnMetaname = returnMatches[1];
      if (returnMatches[2]) out.returnName = returnMatches[2];

      out.returnRecipient = returnMatches[1] ? returnMatches[1] + "@" + returnMatches[2] : returnMatches[2];
    }
  }

  return out;
}

// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under AGPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { getNameParts } from "./currency";

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

export function parseCommonMeta(
  nameSuffix: string,
  metadata: string | undefined | null
): CommonMeta | null {
  if (!metadata) return null;

  const custom: Record<string, string> = {};
  const out: CommonMeta = { custom };

  const metaParts = metadata.split(";");
  if (metaParts.length <= 0) return null;

  const nameParts = getNameParts(nameSuffix, metaParts[0]);
  if (nameParts) {
    out.metaname = nameParts.metaname;
    out.name = nameParts.nameWithSuffix;

    out.recipient = nameParts.metaname
      ? nameParts.metaname + "@" + nameParts.nameWithSuffix
      : nameParts.nameWithSuffix;
  }

  for (let i = 0; i < metaParts.length; i++) {
    const metaPart = metaParts[i];
    const kv = metaPart.split("=", 2);

    if (i === 0 && nameParts) continue;

    if (kv.length === 1) {
      custom[i.toString()] = kv[0];
    } else {
      custom[kv[0]] = kv.slice(1).join("=");
    }
  }

  const rawReturn = out.return = custom.return;
  if (rawReturn) {
    const returnParts = getNameParts(nameSuffix, rawReturn);
    if (returnParts) {
      out.returnMetaname = returnParts.metaname;
      out.returnName = returnParts.nameWithSuffix;

      out.returnRecipient = returnParts.metaname
        ? returnParts.metaname + "@" + returnParts.nameWithSuffix
        : returnParts.nameWithSuffix;
    }
  }

  return out;
}

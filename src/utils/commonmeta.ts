import { getNameRegex } from "./currency";

export interface CommonMeta {
  metaname?: string;
  name?: string;
  recipient?: string;

  returnMetaname?: string;
  returnName?: string;
  returnRecipient?: string;

  [key: string]: string | undefined;
}

export function parseCommonMeta(nameSuffix: string, metadata: string | undefined | null): CommonMeta | null {
  if (!metadata) return null;

  const parts: CommonMeta = {};

  const metaParts = metadata.split(";");
  if (metaParts.length <= 0) return null;

  const nameMatches = getNameRegex(nameSuffix).exec(metaParts[0]);
  if (nameMatches) {
    if (nameMatches[1]) parts.metaname = nameMatches[1];
    if (nameMatches[2]) parts.name = nameMatches[2];

    parts.recipient = nameMatches[1] ? nameMatches[1] + "@" + nameMatches[2] : nameMatches[2];
  }

  for (let i = 0; i < metaParts.length; i++) {
    const metaPart = metaParts[i];
    const kv = metaPart.split("=", 2);

    if (i === 0 && nameMatches) continue;

    if (kv.length === 1) {
      parts[i.toString()] = kv[0];
    } else {
      parts[kv[0]] = kv.slice(1).join("=");
    }
  }

  if (parts.return) {
    const returnMatches = getNameRegex(nameSuffix).exec(parts.return);
    if (returnMatches) {
      if (returnMatches[1]) parts.returnMetaname = returnMatches[1];
      if (returnMatches[2]) parts.returnName = returnMatches[2];

      parts.returnRecipient = returnMatches[1] ? returnMatches[1] + "@" + returnMatches[2] : returnMatches[2];
    }
  }

  return parts;
}

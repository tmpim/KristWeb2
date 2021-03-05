// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import { sha256, doubleSHA256 } from "@utils/crypto";

const hexToBase36 = (input: number): string => {
  const byte = 48 + Math.floor(input / 7);
  return String.fromCharCode(byte + 39 > 122 ? 101 : byte > 57 ? byte + 39 : byte);
};

export const makeV2Address = async (addressPrefix: string, key: string): Promise<string> => {
  const chars = ["", "", "", "", "", "", "", "", ""];
  let chain = addressPrefix;
  let hash = await doubleSHA256(key);

  for (let i = 0; i <= 8; i++) {
    chars[i] = hash.substring(0, 2);
    hash = await doubleSHA256(hash);
  }

  for (let i = 0; i <= 8;) {
    const index = parseInt(hash.substring(2 * i, 2 + (2 * i)), 16) % 9;

    if (chars[index] === "") {
      hash = await sha256(hash);
    } else {
      chain += hexToBase36(parseInt(chars[index], 16));
      chars[index] = "";
      i++;
    }
  }

  return chain;
};

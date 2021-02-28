// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt

/** This file contains a polyfill for CryptoJS AES decryption and password
 * derivation function. */

import { MD5 } from "spu-md5";
import base64 from "base64-arraybuffer";

interface EvpKey {
  key: Uint8Array;
  iv: Uint8Array;
  cryptoKey: CryptoKey;
}

/**
 * Derive an AES key using {@link https://wiki.openssl.org/index.php/EVP_Key_Derivation|EvpKDF}.
 * Uses a single iteration and MD5 for hashing. Designed to be compatible with <code>CryptoJS.AES</code>.
 *
 * Links:
 * {@link https://wiki.openssl.org/index.php/EVP_Key_Derivation}
 * {@link https://github.com/brix/crypto-js/blob/develop/src/evpkdf.js}
 * {@link https://github.com/brix/crypto-js/blob/develop/src/cipher-core.js}
 * {@link https://github.com/brix/crypto-js/blob/develop/src/aes.js}
 *
 * Implementation mostly sourced from:
 * {@link https://stackoverflow.com/a/27250883/1499974}
 * {@link https://stackoverflow.com/a/52598588/1499974}
 * {@link https://stackoverflow.com/a/29152379/1499974}
 *
 * @param password - The bytes of the password used for key derivation.
 * @param keySize - The number of bytes used for the key.
 * @param ivSize - The number of bytes used for the IV.
 * @param salt - The salt used for key derivation.
 * @param iterations - The number of iterations used.
 * @returns The key and IV (Uint8Array) derived from the password.
 */
async function evpKDF(password: Uint8Array, keySize: number, ivSize: number,
                      salt: Uint8Array, iterations: number): Promise<EvpKey> {
  const targetKeySize = keySize + ivSize;
  const derivedBytes = new Uint8Array(targetKeySize * 4);

  let numberOfDerivedWords = 0;
  let block: Uint8Array | null = null;
  let md5 = new MD5();

  while (numberOfDerivedWords < targetKeySize) {
    for (let i = 0; i < iterations; i++) {
      if (block !== null) md5.update(block);

      if (i === 0) { // hash the password and salt on the first iteration only
        md5.update(password);
        md5.update(salt);
      }

      block = md5.toUint8Array();
      md5 = new MD5();
    }

    if (block === null)
      throw new Error("EvpKDF block is null!");

    const blockLength = Math.min(block.length, (targetKeySize - numberOfDerivedWords) * 4);
    derivedBytes.set(block.subarray(0, blockLength), numberOfDerivedWords * 4);

    numberOfDerivedWords += block.length / 4;
  }

  // get the key from the first 32 bytes, then the IV from the next 32
  const key = derivedBytes.subarray(0, keySize * 4);
  const iv = derivedBytes.subarray(keySize * 4, (keySize * 4) + (ivSize * 4));

  // create a SubtleCrypto CryptoKey with the given raw key bytes (for AES-CBC encrypt/decrypt)
  const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-CBC", true, ["encrypt", "decrypt"]);

  return { key, iv, cryptoKey };
}

/**
 * Decrypt using AES-CBC and {@link https://wiki.openssl.org/index.php/EVP_Key_Derivation|EvpKDF}.
 * Uses a single iteration and MD5 for hashing. Designed to be compatible with <code>CryptoJS.AES.decrypt</code>.
 *
 * Links:
 * {@link https://wiki.openssl.org/index.php/EVP_Key_Derivation}
 * {@link https://github.com/brix/crypto-js/blob/develop/src/evpkdf.js}
 * {@link https://github.com/brix/crypto-js/blob/develop/src/cipher-core.js}
 * {@link https://github.com/brix/crypto-js/blob/develop/src/aes.js}
 *
 * Implementation mostly sourced from:
 * {@link https://stackoverflow.com/a/27250883/1499974}
 * {@link https://stackoverflow.com/a/52598588/1499974}
 * {@link https://stackoverflow.com/a/29152379/1499974}
 *
 * @param encrypted - The base64-encoded encrypted data.
 * @param password - The password used to decrypt the data.
 * @returns The decrypted data.
 */
export async function decryptCryptoJS(encrypted: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const keySize = 256 / 32;
  const ivSize = 128 / 32;

  // Decode the encrypted base64 string to get the raw bytes
  const cipherText = new Uint8Array(base64.decode(encrypted));

  // Check if the cipher text begins with "Salted__":
  const prefix = new Uint32Array(cipherText.buffer, 0, 2);
  const salted = prefix[0] === 0x746c6153 && prefix[1] === 0x5f5f6465;

  // Fetch the salt from the cipher text, if necessary, and get the actual cipher text
  const salt = cipherText.subarray(8, 16);
  const actualCipherText = salted ? cipherText.subarray(16, cipherText.length) : cipherText;

  // Derive the key and IV
  const { cryptoKey, iv } = await evpKDF(encoder.encode(password), keySize, ivSize, salt, 1);

  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, cryptoKey, actualCipherText);
  return decoder.decode(decrypted); // decode Uint8Array to UTF-8
}

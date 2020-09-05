import base64 from "base64-arraybuffer";

import { toHex, fromHex } from "./";

// -----------------------------------------------------------------------------
// SHA256
// -----------------------------------------------------------------------------

/** 
 * Utility function to return the hexadecimal SHA-256 digest of an input string.
 * 
 * @param input - The input string to hash.
 * @returns The hexadecimal SHA-256 digest of <code>input</code>.
 */
export async function sha256(input: string): Promise<string> {
  const inputUtf8 = new TextEncoder().encode(input); // Convert input to UTF-8
  return toHex(await crypto.subtle.digest("SHA-256", inputUtf8));
}

/** 
 * Utility function to return the double hexadecimal SHA-256 digest of an input string.
 * This is equivalent to <code>sha256(sha256(input))</code>.
 * 
 * @param input - The input string to hash.
 * @returns The double hexadecimal SHA-256 digest of <code>input</code>.
 */
export async function doubleSHA256(input: string): Promise<string> {
  return sha256(await sha256(input));
}

// -----------------------------------------------------------------------------
// AES-GCM
// -----------------------------------------------------------------------------
export type AESEncryptedString = string;

/**
 * Encrypts the given input string with the AES-GCM cipher, deriving a key from
 * the given password with SHA-256. 
 * 
 * Implementation mostly sourced from:
 * {@link https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a}
 * 
 * @param input - The plain text input to be encrypted.
 * @param password - The password used to encrypt the input data.
 * @returns The encrypted cipher text (`IV (12 bytes hex) + CT (base64)`)
 */
export async function aesGcmEncrypt(input: string, password: string): Promise<AESEncryptedString> {
  // Hash the password as UTF-8
  const passwordHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));

  // Generate a 96-bit random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Generate the key from the password
  const algorithm = { name: "AES-GCM", iv };
  const key = await crypto.subtle.importKey("raw", passwordHash, algorithm, false, ["encrypt"]);

  // Encrypt the UTF-8-encoded input
  const cipherText = await crypto.subtle.encrypt(algorithm, key, new TextEncoder().encode(input));

  // Return the IV (as hex) + cipher text (as base64) together
  return toHex(iv) + base64.encode(cipherText);
}

/**
 * Decrypts the given input cipher text with the AES-GCM cipher, deriving a key 
 * from the given password with SHA-256. The input must be of the form
 * `IV (12 bytes hex) + CT (base64)`.
 * 
 * Implementation mostly sourced from:
 * {@link https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a}
 * 
 * @param input - The IV and cipher text to decrypt.
 * @param password - The password used to decrypt the input cipher text.
 * @returns The decrypted plain text data.
 */
export async function aesGcmDecrypt(input: AESEncryptedString, password: string): Promise<AESEncryptedString> {
  // Hash the password as UTF-8
  const passwordHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));

  // Get the IV from the encrypted string (first 96 bits/12 bytes/24 hex chars)
  const iv = fromHex(input.slice(0, 24));

  // Generate the key from the password
  const algorithm = { name: "AES-GCM", iv };
  const key = await crypto.subtle.importKey("raw", passwordHash, algorithm, false, ["decrypt"]);

  // Decode the base64 cipher text to a UTF-8 Uint8Array
  const cipherText = base64.decode(input.slice(24));

  // Decrypt the cipher text
  const dec = await crypto.subtle.decrypt(algorithm, key, cipherText);

  // Decode from UTF-8
  return new TextDecoder().decode(dec);
}

// -----------------------------------------------------------------------------
// CryptoJS
// -----------------------------------------------------------------------------

/** Polyfill for decrypting CryptoJS AES strings. This is used to migrate 
 * local storage from KristWeb v1. */
export { decryptCryptoJS } from "./CryptoJS";

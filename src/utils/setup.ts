import { toHex } from "./";
import Debug from "debug";

// Set up custom debug formatters
// Booleans (%b)
Debug.formatters.b = (v: boolean) => v ? "true" : "false";
// Buffers as hex strings (%x)
Debug.formatters.x = (v: ArrayBufferLike | Uint8Array) => toHex(v);

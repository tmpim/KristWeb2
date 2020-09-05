import { toHex } from "./";

import * as serviceWorker from "./serviceWorker";
import Debug from "debug";

// Set up custom debug formatters
// Booleans (%b)
Debug.formatters.b = (v: boolean) => v ? "true" : "false";
// Buffers as hex strings (%x)
Debug.formatters.x = (v: ArrayBufferLike | Uint8Array) => toHex(v);

// Set up and register the service worker to cache the app and handle 
// notifications
// TODO: change `unregister` to `register`
serviceWorker.unregister();

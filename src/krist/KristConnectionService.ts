import WebSocketAsPromised from "websocket-as-promised";
import WSPOptions from "websocket-as-promised/types/options";

import { KristApiWsResponse } from "./types/KristApiTypes";

import { sleep } from "@utils";

import Debug from "debug";
import { KristWsAnyMessage, KristWsResponseMessage } from "./types/ws/KristWsTypes";
import { KristWsApi } from "./KristWsApi";
import { KristAddress } from "./types/KristTypes";
const debug = Debug("kristweb:connection");

const WSP_OPTIONS: WSPOptions = {
  packMessage: data => JSON.stringify(data),
  unpackMessage: data => JSON.parse(data.toString())
};

/** Silly typing for an object containing a promise's resolve and reject
 * functions. */
interface PromiseResponseHandler<T> {
  resolve: (value?: T | PromiseLike<T>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reject: (reason?: any) => void;
};

export class KristConnectionService {
  syncNode?: string;

  ws?: WebSocketAsPromised;
  connected = false;
  ready = false;

  /** The API wrapper */
  wsApi: KristWsApi;

  /** The Krist websocket API requires an ID on each message to the server, so
   * that the client knows which messages the server is responding to. This
   * counter is reset on each connection. */
  messageIDCounter = 0;
  /** When we send a message out, this map keeps track of our own message IDs,
   * and resolves the promises when the server responds to them. */
  messageResponses?: Map<number, PromiseResponseHandler<KristWsResponseMessage>>;

  /** Whether or not the current websocket is authenticated as a guest. */
  isGuest = false;
  /** The current address that the websocket is authenticated as, if any. */
  currentAddress?: KristAddress;

  constructor() {
    this.wsApi = new KristWsApi(this);
  }

  async connect(syncNode: string): Promise<void> {
    // Close any existing connection
    if (this.connected && this.ws)
      await this.ws.close();

    this.syncNode = syncNode;

    // Fetch the WS token URL. Remove trailing slash and grab /ws/start
    const connectionURL = this.syncNode.replace(/\/$/, "") + "/ws/start";
    const resp: KristApiWsResponse = await fetch(connectionURL, {
      method: "POST"
    }).then(r => r.json());
    if (!resp || !resp.ok || !resp.url) 
      throw new Error("Invalid WS response");

    // Prepare to receive responses
    this.messageResponses = new Map();

    this.ws = new WebSocketAsPromised(resp.url, WSP_OPTIONS);
    this.ws.onClose.addListener(this.onDisconnect.bind(this));
    this.ws.onUnpackedMessage.addListener(this.onUnpackedMessage.bind(this));

    await this.ws.open();
    this.connected = true;

    debug("connected");
  }

  async onDisconnect(event: CloseEvent): Promise<void> {
    this.connected = false;
    this.ready = false;
    debug(`disconnected: ${event.reason} (${event.code})`);

    // Reject any existing message requests
    this.messageIDCounter = 0;
    if (this.messageResponses) {
      for (const [, response] of this.messageResponses.entries()) {
        response.reject();
      }
      this.messageResponses.clear();
    }

    // Don't bother reconnecting if the syncNode was unset
    if (!this.syncNode) return;

    debug("reconnecting in 3 seconds");
    await sleep(3000);
    this.connect(this.syncNode);
  }

  /** Sends a message out to the Krist websocket server. This is for the lower
   * level interactions - use {@link KristWsApi} instead. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public sendMessage(type: string, data?: any): Promise<KristWsResponseMessage> {
    return new Promise((resolve, reject) => {
      if (!this.connected || !this.ws || !this.messageResponses) 
        return reject(new Error("Websocket not connected"));

      // Prepare to receive a response
      const messageID = ++this.messageIDCounter;
      this.messageResponses.set(messageID, { resolve, reject });

      // Attach the metadata to the message, creating it if it doesn't exist
      data = data || {};
      data.type = type;
      data.id = messageID;

      this.ws.sendPacked(data);
    });
  }

  /** When a JSON message is received from the websocket, decode it and
   * delegate it to the relevant event handlers. */
  onUnpackedMessage(data: KristWsAnyMessage): void {
    if ("type" in data) {
      // Regular event or server-sent message
      debug("event received from server: %O", data);

      if (data.type === "hello")
        this.ready = true;
    } else if ("ok" in data && "id" in data) {
      // Response to one of our sent messages
      debug("response received from server: %O", data);

      const id = data.id;
      const responses = this.messageResponses;
      if (!responses) 
        throw new Error("Message responses is uninitialised");

      const response = responses.get(id);
      if (!response)
        throw new Error("Received response from server twice, or for a message we never sent");

      // Resolve or reject our response handler depending on whether or not the
      // server gave us an error
      if (!data.ok || data.error)
        response.reject(data);
      else
        response.resolve(data);

      // We're done with the response handler now, remove it
      responses.delete(id);
    } else if ("ok" in data) {
      // Generic response with no type or ID
      debug("generic message received from server: %O", data);
    } else {
      debug("invalid message received from krist server: %O", data);
    }
  }
}

let kristServiceInstance: KristConnectionService;
export const kristService = (): KristConnectionService => {
  return kristServiceInstance // Use existing instance
    || (kristServiceInstance = new KristConnectionService());
};

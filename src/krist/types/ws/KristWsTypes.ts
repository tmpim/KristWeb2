export type KristWsMessageType = "hello" | "keepalive" | "event" | "work";
export interface KristWsMessage {
  type: KristWsMessageType;
}

export interface KristWsOutgoingMessage extends KristWsMessage {
  id: number;
}

export interface KristWsOkMessage {
  ok: boolean;
  error?: string;
}

export interface KristWsResponseMessage extends KristWsOkMessage {
  id: number;
}

export type KristWsAnyMessage = KristWsMessage | KristWsResponseMessage | KristWsOkMessage;
export interface KristAddress {
  address: string;

  balance: number;
  totalin?: number;
  totalout?: number;

  firstseen: string;
}

export type KristTransactionType = "unknown" | "mined" | "name_purchase" | "name_a_record" | "name_transfer" | "transfer";
export interface KristTransaction {
  id: number;
  from: string;
  to: string;
  value: number;
  time: string;
  name: string;
  metadata: string;
  type: KristTransactionType;
}

export type APIResponse<T extends Record<string, any>> = T & {
  ok: boolean;
  error?: string;
}

export type WSConnectionState = "connected" | "disconnected" | "connecting";
export type WSSubscriptionLevel = "blocks" | "ownBlocks" | "transactions" | "ownTransactions" | "names" | "ownNames" | "motd";
export type WSEvent = "block" | "transaction" | "name" | "motd";
export interface WSIncomingMessage {
  id?: number;
  ok?: boolean;
  error?: string;
  type?: "keepalive" | "hello" | "event";

  event?: WSEvent;

  [key: string]: any;
}

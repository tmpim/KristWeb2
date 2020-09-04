import { KristWsMessage, KristWsOkMessage, KristWsResponseMessage } from "./KristWsTypes";
import { DateString, KristBlock, KristAddress } from "../KristTypes";

export interface KristWsMessageHello extends KristWsMessage, KristWsOkMessage {
  type: "hello";
  motd: string;
  motd_set: DateString;
  server_time: DateString;
  work: number;
  last_block: KristBlock;
}

export interface KristWsMessageKeepalive extends KristWsMessage {
  type: "keepalive";
  server_time: DateString;
}

export interface KristWsMessageEvent extends KristWsMessage {
  type: "event";
  event: string;
}

export interface KristWsMessageGetWorkResponse extends KristWsResponseMessage {
  type: "work";
  work: number;
}

export interface KristWsMessageGetMeResponse extends KristWsResponseMessage {
  type: "me";
  isGuest: boolean;
  address?: KristAddress;
}

export interface KristWsMessageLogin extends KristWsResponseMessage {
  type: "login";
  privatekey: string;
}
export interface KristWsMessageLoginResponse extends KristWsResponseMessage {
  type: "login";
  isGuest: boolean;
  address?: KristAddress;
}

export interface KristWsMessageLogoutResponse extends KristWsResponseMessage {
  type: "logout";
}
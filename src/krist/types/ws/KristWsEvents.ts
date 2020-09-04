import { KristBlock } from "../KristTypes";
import { KristWsMessageEvent } from "./KristWsMessages";

export interface KristWsEventBlock extends KristWsMessageEvent {
  event: "block";
  new_work: number;
  block: KristBlock;
}